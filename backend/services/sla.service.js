const { JobQueue } = require('../models/JobQueue');
const { Ticket } = require('../models/Ticket');
const notificationService = require('./notification.service');
const { getIO } = require('../config/socket');

const SLA_INTERVALS = {
  critical: 2 * 60 * 60 * 1000,   // 2 hours
  high: 8 * 60 * 60 * 1000,       // 8 hours
  medium: 24 * 60 * 60 * 1000,    // 24 hours
  low: 72 * 60 * 60 * 1000        // 72 hours
};

const PRIORITY_ESCALATION = {
  low: 'medium',
  medium: 'high',
  high: 'critical',
  critical: 'critical' // Caps at critical
};

async function scheduleSLA(ticketId, priority) {
  try {
    const delay = SLA_INTERVALS[priority] || SLA_INTERVALS.medium;
    const runAt = new Date(Date.now() + delay);

    await JobQueue.create({
      job_type: 'sla_escalate',
      payload: { ticketId },
      run_at: runAt,
      status: 'pending'
    });

    console.log(`⏱️ [SLA] Scheduled escalation check for ticket ${ticketId} at ${runAt}`);
  } catch (err) {
    console.error(`⏱️ [SLA] Failed to schedule SLA for ${ticketId}:`, err.message);
  }
}

async function handleEscalation(ticketId) {
  try {
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) return;

    // Check if resolved
    if (['resolved', 'closed'].includes(ticket.status)) {
      console.log(`⏱️ [SLA] Ticket ${ticketId} already resolved. Ignoring escalation.`);
      return;
    }

    // Escalate priority
    const oldPriority = ticket.priority;
    const newPriority = PRIORITY_ESCALATION[oldPriority];

    if (oldPriority !== newPriority) {
      ticket.priority = newPriority;
      await ticket.save();

      console.log(`⏱️ [SLA] Escalated ticket ${ticketId} from ${oldPriority} to ${newPriority}`);

      // Emit socket event & log notification for admins or assignee
      const io = getIO();
      if (io) {
        io.emit('sla_breach', { ticketId, newPriority });
        
        // Notify the assignee if exists
        if (ticket.assigned_to) {
           await notificationService.createNotification(
             ticket.assigned_to,
             `SLA Breach: Ticket ${ticketId.split('-')[0]}`,
             `Ticket priority automatically escalated to ${newPriority}. Please address immediately.`,
             'sla_breach'
           );
        }
      }

      // Schedule next SLA check based on new priority
      await scheduleSLA(ticketId, newPriority);
    }
  } catch (err) {
    console.error(`⏱️ [SLA] Escalation error for ticket ${ticketId}:`, err);
    throw err; // throw to retry in worker
  }
}

module.exports = {
  scheduleSLA,
  handleEscalation
};
