const { Ticket } = require('../models/Ticket');
const { StaffSkill } = require('../models/StaffSkill');
const { User } = require('../models/User');

async function autoAssignTechnician(ticketId) {
  try {
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) return;

    if (ticket.assigned_to) {
      console.log(`🤖 [Assignment] Ticket ${ticket.id} already assigned.`);
      return;
    }

    // Match: ticket.category = staff_skill.skill_tag
    // Filter: availability = true, current_workload < max_capacity
    // Sort: lowest workload first
    const eligibleSkills = await StaffSkill.findAll({
      where: {
        skill_tag: ticket.category,
        availability: true,
      },
      order: [['current_workload', 'ASC']],
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
    });

    // We filter dynamically if we want exactly strictly less than max capacity 
    // Usually handled in db query, but we can do it here for extra logic.
    const eligibleTechs = eligibleSkills.filter(s => s.current_workload < s.max_capacity);

    if (eligibleTechs.length > 0) {
      const selectedSkill = eligibleTechs[0];

      // Assign ticket
      ticket.assigned_to = selectedSkill.user_id;
      ticket.status = 'assigned';
      await ticket.save();

      // Increment staff workload
      selectedSkill.current_workload += 1;
      await selectedSkill.save();

      console.log(`🤖 [Assignment] Auto-assigned ticket ${ticket.id} to ${selectedSkill.user.name}`);
      
      // Emit socket event implicitly done when saving or we trigger it from controller
      // Returning truthy to allow controller to chain SLA & Notification
      return { success: true, assignee: selectedSkill.user_id };
    } else {
      console.log(`🤖 [Assignment] No eligible technicians found for ticket ${ticket.id}`);
      return { success: false, reason: 'No eligible technician' };
    }
  } catch (error) {
    console.error(`🤖 [Assignment] Error assigning ticket ${ticketId}:`, error);
    return { success: false, error: error.message };
  }
}

async function manualAssign(ticketId, technicianId) {
  const ticket = await Ticket.findByPk(ticketId);
  if (!ticket) throw new Error('Ticket not found');

  ticket.assigned_to = technicianId;
  ticket.status = 'assigned';
  await ticket.save();

  console.log(`👨‍🔧 [Assignment] Manually assigned ticket ${ticket.id} to user ${technicianId}`);
  return ticket;
}

module.exports = {
  autoAssignTechnician,
  manualAssign
};
