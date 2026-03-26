const { Router } = require('express');
const { body } = require('express-validator');
const { sendOtp, register, login, refreshToken, getMe, getTechnicians, updateProfile, changePassword } = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = Router();

router.post(
  '/send-otp',
  [body('email').isEmail().normalizeEmail()],
  sendOtp
);

router.post(
  '/register',
  [
    body('name').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('otp').isLength({ min: 6, max: 6 }),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  login
);

router.post('/refresh', refreshToken);

router.get('/me', authMiddleware, getMe);
router.patch('/profile', authMiddleware, updateProfile);
router.patch('/change-password', authMiddleware, changePassword);
router.get('/technicians', authMiddleware, getTechnicians);

module.exports = router;
