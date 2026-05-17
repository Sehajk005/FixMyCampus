const { Router } = require('express');
const { body } = require('express-validator');
const {
  createTicket, getMyTickets, getTicketById, getAllTickets, updateTicket, getAssignedToMe,
  serveTicketPhoto, addTicketUpdate, addFeedback, assignTechnician, upvoteTicket
} = require('../controllers/ticket.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { uploadMiddleware } = require('../middleware/upload.middleware');

const router = Router();

// All ticket routes require authentication
router.use(authMiddleware);

router.post(
  '/',
  uploadMiddleware.single('photo'),
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
router.get('/photo/:filename', serveTicketPhoto);
router.get('/:id', getTicketById);
router.patch('/:id', updateTicket);
router.post('/:id/updates', addTicketUpdate);
router.post(
  '/:id/feedback',
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
    body('comment').optional().isString().trim()
  ],
  addFeedback
);

// Admin manual assign
router.patch('/:id/assign', assignTechnician);

// Firebase upvote (student logic)
router.post('/feed/:id/upvote', upvoteTicket);

module.exports = router;
