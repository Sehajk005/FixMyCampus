const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { Ticket } = require('../models/Ticket');
const { Message } = require('../models/Message');
const { User } = require('../models/User');
const { TicketUpdate } = require('../models/TicketUpdate');
const { Feedback } = require('../models/Feedback');
const assignmentService = require('../services/assignment.service');
const firebaseService = require('../services/firebase.service');
const slaService = require('../services/sla.service');
const notificationService = require('../services/notification.service');
const { getIO } = require('../config/socket');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

async function createTicket(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { title, description, category, location, priority, is_anonymous } = req.body;

  // Duplicate Detection
  const existingTicket = await Ticket.findOne({
    where: {
      category,
      location,
      status: { [Op.notIn]: ['resolved', 'closed'] }
    }
  });

  if (existingTicket) {
    return res.status(409).json({ 
      error: 'An open ticket already exists for this issue.',
      existing_ticket_id: existingTicket.id 
    });
  }

  let photo_url = null;
  if (req.file) {
    const ext = path.extname(req.file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, req.file.buffer);
    photo_url = `/tickets/photo/${filename}`;
  }

  const ticket = await Ticket.create({
    title, 
    description, 
    category, 
    location,
    priority: priority || 'medium',
    submitter_id: req.user.id,
    photo_url,
    is_anonymous: is_anonymous === 'true' || is_anonymous === true,
  });

  // PH4: Run auto-assignment and sync to Firebase
  const assignResult = await assignmentService.autoAssignTechnician(ticket.id);
  
  if (assignResult && assignResult.success) {
    // Escalate immediately upon assignment
    await slaService.scheduleSLA(ticket.id, ticket.priority);
    // Reload ticket to get updated assignment status
    await ticket.reload();
    
    // Notify assignee
    await notificationService.createNotification(
      ticket.assigned_to,
      'New Ticket Assigned',
      `You have been assigned to: ${ticket.title}`,
      'assignment'
    );
    
    const io = getIO();
    if (io) io.emit('new_assignment', { ticketId: ticket.id, assigned_to: ticket.assigned_to });
  }

  // PH4: Firebase Feed write
  await firebaseService.syncTicketToFeed(ticket);

  const io = getIO();
  if (io) io.emit('new_ticket', ticket);

  res.status(201).json(ticket);
}

async function getMyTickets(req, res) {
  const whereClause = { submitter_id: req.user.id };
  
  if (req.query.status) whereClause.status = req.query.status;
  if (req.query.priority) whereClause.priority = req.query.priority;
  if (req.query.category) whereClause.category = req.query.category;

  const tickets = await Ticket.findAll({
    where: whereClause,
    include: [{ model: User, as: 'submitter', attributes: ['id', 'name', 'email'] }],
    order: [['created_at', 'DESC']],
  });
  
  // Identity masking is not needed here as they are their own tickets
  res.json(tickets);
}

async function getTicketById(req, res) {
  const ticket = await Ticket.findByPk(req.params.id, {
    include: [
      { model: User, as: 'submitter', attributes: ['id', 'name', 'email'] },
      {
        model: Message, as: 'messages',
        include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'email'] }],
        order: [['created_at', 'ASC']],
      },
      {
        model: TicketUpdate, as: 'updates',
        include: [{ model: User, as: 'updater', attributes: ['name'] }],
        order: [['created_at', 'ASC']],
      },
      { model: Feedback, as: 'feedback' }
    ],
  });

  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const isSubmitter  = ticket.submitter_id === req.user.id;
  const isAdmin      = req.user.role === 'admin';
  const isAssigned   = ticket.assigned_to === req.user.id;

  if (!isSubmitter && !isAdmin && !isAssigned) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Identity Masking
  if (ticket.is_anonymous && !isSubmitter && !isAdmin) {
    if (ticket.submitter) {
      ticket.submitter.name = 'Anonymous Student';
      ticket.submitter.email = 'hidden';
    }
  }

  res.json(ticket);
}

async function serveTicketPhoto(req, res) {
  const ticket = await Ticket.findOne({ where: { photo_url: `/tickets/photo/${req.params.filename}` } });
  if (!ticket) return res.status(404).json({ error: 'Image not found' });

  const isSubmitter  = ticket.submitter_id === req.user.id;
  const isAdmin      = req.user.role === 'admin';
  const isAssigned   = ticket.assigned_to === req.user.id;

  if (!isSubmitter && !isAdmin && !isAssigned) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const filePath = path.join(uploadsDir, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File missing' });

  res.sendFile(filePath);
}

async function getAllTickets(req, res) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const tickets = await Ticket.findAll({
    include: [
      { model: User, as: 'submitter', attributes: ['id', 'name', 'email'] },
      { model: User, foreignKey: 'assigned_to', as: 'assignee', attributes: ['id', 'name', 'email'] },
    ],
    order: [['created_at', 'DESC']],
  });
  
  tickets.forEach(ticket => {
    if (ticket.is_anonymous) {
       // Since admin is requesting, we don't necessarily mask, or we can add a flag. We'll leave it visible to admins.
    }
  });

  res.json(tickets);
}

async function getAssignedToMe(req, res) {
  if (req.user.role !== 'technician') return res.status(403).json({ error: 'Forbidden' });
  const tickets = await Ticket.findAll({
    where: { assigned_to: req.user.id },
    include: [{ model: User, as: 'submitter', attributes: ['id', 'name', 'email'] }],
    order: [['created_at', 'DESC']],
  });
  
  tickets.forEach(ticket => {
     if (ticket.is_anonymous) {
       ticket.submitter.name = 'Anonymous Student';
       ticket.submitter.email = 'hidden';
     }
  });
  res.json(tickets);
}

// Pipeline transitions
const STATUS_FLOW = {
  'submitted': ['verified'],
  'verified': ['assigned'],
  'assigned': ['in_progress'],
  'in_progress': ['resolved'],
  'resolved': ['closed'],
  'closed': []
};

async function updateTicket(req, res) {
  const ticket = await Ticket.findByPk(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const isAdmin      = req.user.role === 'admin';
  const isAssignedTech = req.user.role === 'technician' && ticket.assigned_to === req.user.id;

  if (!isAdmin && !isAssignedTech) return res.status(403).json({ error: 'Forbidden' });

  const { status, assigned_to, note } = req.body;
  const updates = {};
  
  let old_status = ticket.status;

  if (status && status !== ticket.status) {
    if (!isAdmin && (!STATUS_FLOW[ticket.status] || !STATUS_FLOW[ticket.status].includes(status))) {
      return res.status(400).json({ error: `Invalid status transition from ${ticket.status} to ${status}` });
    }
    ticket.status = status;
    updates.new_status = status;
  }

  if (assigned_to !== undefined && isAdmin) ticket.assigned_to = assigned_to || null;
  
  await ticket.save();

  if (updates.new_status || note) {
    await TicketUpdate.create({
      ticket_id: ticket.id,
      updated_by: req.user.id,
      old_status: old_status,
      new_status: updates.new_status || old_status,
      note: note || `Status updated to ${ticket.status}`
    });
  }

  // PH4: Firebase Update
  if (updates.new_status) {
    if (ticket.status === 'closed') {
       await firebaseService.removeTicketFromFeed(ticket.id);
    } else {
       await firebaseService.updateTicketInFeed(ticket);
    }
    
    // Notify submitter of status change
    await notificationService.createNotification(
      ticket.submitter_id,
      'Ticket Status Updated',
      `Your ticket ${ticket.title} is now ${ticket.status}.`,
      'status_update'
    );
    
    const io = getIO();
    if (io) io.emit('status_update', { ticketId: ticket.id, status: ticket.status });
  }

  res.json(ticket);
}

async function addTicketUpdate(req, res) {
  const ticket = await Ticket.findByPk(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  
  const isAdmin = req.user.role === 'admin';
  const isAssignedTech = req.user.role === 'technician' && ticket.assigned_to === req.user.id;
  
  if (!isAdmin && !isAssignedTech) return res.status(403).json({ error: 'Forbidden' });

  if (!req.body.note) {
    return res.status(400).json({ error: 'Note is required' });
  }

  const update = await TicketUpdate.create({
    ticket_id: ticket.id,
    updated_by: req.user.id,
    old_status: ticket.status,
    new_status: ticket.status,
    note: req.body.note
  });

  res.status(201).json(update);
}

async function addFeedback(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const ticket = await Ticket.findByPk(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  if (ticket.submitter_id !== req.user.id) {
    return res.status(403).json({ error: 'Only the submitter can leave feedback' });
  }

  if (!['resolved', 'closed'].includes(ticket.status)) {
    return res.status(400).json({ error: 'Feedback can only be provided for resolved or closed tickets' });
  }

  try {
    const feedback = await Feedback.create({
      ticket_id: ticket.id,
      user_id: req.user.id,
      rating: req.body.rating,
      comment: req.body.comment
    });
    return res.status(201).json(feedback);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Feedback has already been provided for this ticket.' });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function assignTechnician(req, res) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  
  const { technicianId } = req.body;
  if (!technicianId) return res.status(400).json({ error: 'technicianId is required' });

  try {
    const ticket = await assignmentService.manualAssign(req.params.id, technicianId);
    
    await slaService.scheduleSLA(ticket.id, ticket.priority);
    await firebaseService.updateTicketInFeed(ticket);

    await notificationService.createNotification(
      technicianId,
      'New Ticket Assigned',
      `Admin assigned you to: ${ticket.title}`,
      'assignment'
    );
    
    const io = getIO();
    if (io) io.emit('new_assignment', { ticketId: ticket.id, assigned_to: technicianId });

    res.json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function upvoteTicket(req, res) {
  // Can be called by student role
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    
    const userId = req.user.id;
    const result = await firebaseService.upvoteTicket(ticket.id, userId);

    if (result && result.alreadyUpvoted) {
      return res.status(400).json({ error: 'You have already upvoted this ticket.' });
    }

    res.json({ success: true, upvotes: result ? result.upvotes : null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { 
  createTicket, 
  getMyTickets, 
  getTicketById, 
  getAllTickets, 
  updateTicket, 
  getAssignedToMe,
  serveTicketPhoto,
  addTicketUpdate,
  addFeedback,
  assignTechnician,
  upvoteTicket
};