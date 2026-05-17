const { Notification } = require('../models/Notification');
const { getIO } = require('../config/socket');

async function createNotification(userId, title, message, type = 'system') {
  try {
    const notif = await Notification.create({
      user_id: userId,
      title,
      message,
      type,
      is_read: false
    });

    console.log(`🔔 [Notification] Created for user ${userId}: ${title}`);

    // Emit socket event to personal room
    const io = getIO();
    if (io) {
      io.to(`user:${userId}`).emit('notification', {
        id: notif.id,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        is_read: notif.is_read,
        created_at: notif.created_at
      });
    }

    return notif;
  } catch (err) {
    console.error(`🔔 [Notification] Error creating notification for ${userId}:`, err.message);
  }
}

module.exports = {
  createNotification
};
