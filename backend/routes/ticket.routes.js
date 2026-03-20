const { Router } = require('express');
const { body } = require('express-validator');
const {
  createTicket, getMyTickets, getTicketById, getAllTickets, updateTicket, getAssignedToMe,
} = require('../controllers/ticket.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = Router();

// All ticket routes require authentication
router.use(authMiddleware);

router.post(
  '/',
  [
    body('title').notEmpty().trim(),
    body('description').notEmpty().trim(),
    body('category').isIn([
      'electrical', 'wifi', 'plumbing', 'cleanliness',
      'furniture', 'ac_hvac', 'security', 'other',
    ]),
    body('location').notEmpty().trim(),
  ],
  createTicket
);

router.get('/mine', getMyTickets);
router.get('/all', getAllTickets);
router.get('/assigned-to-me', getAssignedToMe);
router.get('/:id', getTicketById);
router.patch('/:id', updateTicket);

module.exports = router;
