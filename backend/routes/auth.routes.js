const { Router } = require('express');
const { body } = require('express-validator');
const {
  resendOtp,
  register,
  verifyOtp,
  login,
  refreshToken,
  logout,
  getMe,
  getTechnicians,
  updateProfile,
  changePassword,
  getMySkills,
  updateMySkills,
  googleAuth,
} = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = Router();

router.post(
  '/otp/resend',
  [body('email').isEmail().normalizeEmail()],
  resendOtp
);

router.post(
  '/register',
  [
    body('name').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
  ],
  register
);

router.post(
  '/otp/verify',
  [
    body('email').isEmail().normalizeEmail(),
    body('otp').isLength({ min: 6, max: 6 }),
  ],
  verifyOtp
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  login
);

router.post('/refresh-token', refreshToken);

router.post('/logout', logout);
router.post('/google', googleAuth);

router.get('/me', authMiddleware, getMe);
router.get('/me/skills', authMiddleware, getMySkills);
router.put('/me/skills', authMiddleware, updateMySkills);
router.patch('/profile', authMiddleware, updateProfile);
router.patch('/change-password', authMiddleware, changePassword);
router.get('/technicians', authMiddleware, getTechnicians);

module.exports = router;
