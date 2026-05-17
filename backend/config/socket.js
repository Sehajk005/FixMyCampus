const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { Message } = require('../models/Message');

let io;
const onlineUsers = new Map(); // socket.id -> { userId, role }

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // JWT auth middleware on socket handshake (ADD-05)
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌  Socket connected: ${socket.user.email} [${socket.id}]`);
    
    // Track online user
    onlineUsers.set(socket.id, { userId: socket.user.id, role: socket.user.role });
    io.emit('presence', Array.from(onlineUsers.values()));

    // Join personal room for notifications
    socket.join(`user:${socket.user.id}`);

    // Join ticket room (ORM-10)
    socket.on('join_room', (ticketId) => {
      const room = `ticket:${ticketId}`;
      socket.join(room);
      console.log(`   → joined room ${room}`);
    });

    // Send message — persist to DB + broadcast (ORM-10)
    socket.on('message', async ({ ticketId, content }) => {
      try {
        const msg = await Message.create({
          ticket_id: ticketId,
          sender_id: socket.user.id,
          content,
        });

        const room = `ticket:${ticketId}`;
        io.to(room).emit('new_message', {
          id: msg.id,
          ticket_id: ticketId,
          sender_id: socket.user.id,
          sender_email: socket.user.email,
          content,
          created_at: msg.created_at,
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('leave_room', (ticketId) => {
      socket.leave(`ticket:${ticketId}`);
    });

    // Typing indicators
    socket.on('typing', ({ ticketId }) => {
      socket.to(`ticket:${ticketId}`).emit('typing', { userId: socket.user.id, name: socket.user.email });
    });

    socket.on('stop_typing', ({ ticketId }) => {
      socket.to(`ticket:${ticketId}`).emit('stop_typing', { userId: socket.user.id });
    });

    socket.on('disconnect', () => {
      console.log(`🔌  Socket disconnected: ${socket.id}`);
      onlineUsers.delete(socket.id);
      io.emit('presence', Array.from(onlineUsers.values()));
    });
  });

  return io;
}

function getIO() {
  return io || null;
}

module.exports = { initSocket, getIO };
