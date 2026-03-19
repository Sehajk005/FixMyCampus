const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const ticketRoutes = require('./routes/ticket.routes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check (BE-01)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Fix My Campus API',
    timestamp: new Date().toISOString(),
    stack: ['Node.js', 'Express', 'MySQL', 'Sequelize', 'Socket.io'],
  });
});

// Routes
app.use('/auth', authRoutes);
app.use('/tickets', ticketRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

module.exports = app;
