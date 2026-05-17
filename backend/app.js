const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth.routes');
const ticketRoutes = require('./routes/ticket.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
// Security and middleware
const applySecurity = require('./middleware/security');
applySecurity(app);

// CORS + parsers
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check (BE-01)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Fix My Campus API',
    timestamp: new Date().toISOString(),
    stack: ['Node.js', 'Express', 'MySQL', 'Sequelize', 'Socket.io'],
  });
});

// Swagger API docs
const mountSwagger = require('./swagger');
mountSwagger(app);

// Rate limiters
const { authLimiter, ticketLimiter, globalLimiter } = require('./middleware/rateLimit');

// Apply global limiter first
app.use(globalLimiter);

// Routes (scoped rate limits)
app.use('/auth', authLimiter, authRoutes);
app.use('/tickets', ticketLimiter, ticketRoutes);
app.use('/admin', adminRoutes);

// Finalize middleware (call AFTER all routes including GraphQL are registered)
function finalize() {
  const { applyErrorHandlers } = require('./middleware/errorHandler');
  applyErrorHandlers(app);
}

module.exports = app;
module.exports.finalize = finalize;
