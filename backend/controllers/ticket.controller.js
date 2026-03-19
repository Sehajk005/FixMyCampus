const { validationResult } = require('express-validator');
const { Ticket } = require('../models/Ticket');
const { Message } = require('../models/Message');
const { User } = require('../models/User');

// BE-07: POST /tickets
async function createTicket(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { title, description, category, location, priority } = req.body;
  const ticket = await Ticket.create({
    title, description, category, location,
    priority: priority || 'medium',
    submitter_id: req.user.id,
  });
  res.status(201).json(ticket);
}

// BE-08: GET /tickets/mine
async function getMyTickets(req, res) {
  const tickets = await Ticket.findAll({
    where: { submitter_id: req.user.id },
    include: [{ model: User, as: 'submitter', attributes: ['id', 'name', 'email'] }],
    order: [['created_at', 'DESC']],
  });
  res.json(tickets);
}

// BE-09: GET /tickets/:id — submitter, admin, OR assigned technician can view
async function getTicketById(req, res) {
  const ticket = await Ticket.findByPk(req.params.id, {
    include: [
      { model: User, as: 'submitter', attributes: ['id', 'name', 'email'] },
      {
        model: Message, as: 'messages',
        include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'email'] }],
        order: [['created_at', 'ASC']],
      },
    ],
  });

  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const isSubmitter  = ticket.submitter_id === req.user.id;
  const isAdmin      = req.user.role === 'admin';
  const isAssigned   = ticket.assigned_to === req.user.id;

  if (!isSubmitter && !isAdmin && !isAssigned) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json(ticket);
}

// GET /tickets/all — admin only
async function getAllTickets(req, res) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const tickets = await Ticket.findAll({
    include: [
      { model: User, as: 'submitter', attributes: ['id', 'name', 'email'] },
      { model: User, foreignKey: 'assigned_to', as: 'assignee', attributes: ['id', 'name', 'email'] },
    ],
    order: [['created_at', 'DESC']],
  });
  res.json(tickets);
}

// GET /tickets/assigned-to-me — technician only
async function getAssignedToMe(req, res) {
  if (req.user.role !== 'technician') return res.status(403).json({ error: 'Forbidden' });
  const tickets = await Ticket.findAll({
    where: { assigned_to: req.user.id },
    include: [{ model: User, as: 'submitter', attributes: ['id', 'name', 'email'] }],
    order: [['created_at', 'DESC']],
  });
  res.json(tickets);
}

// PATCH /tickets/:id — admin OR assigned technician
async function updateTicket(req, res) {
  const ticket = await Ticket.findByPk(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const isAdmin      = req.user.role === 'admin';
  const isAssignedTech = req.user.role === 'technician' && ticket.assigned_to === req.user.id;

  if (!isAdmin && !isAssignedTech) return res.status(403).json({ error: 'Forbidden' });

  const { status, assigned_to } = req.body;
  if (status) ticket.status = status;
  if (assigned_to !== undefined && isAdmin) ticket.assigned_to = assigned_to || null;
  await ticket.save();
  res.json(ticket);
}

module.exports = { createTicket, getMyTickets, getTicketById, getAllTickets, updateTicket, getAssignedToMe };