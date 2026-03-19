const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const { User } = require('../models/User');
const { OtpToken } = require('../models/OtpToken');
const { RefreshToken } = require('../models/RefreshToken');
const { sendOtpEmail } = require('../config/mailer');

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
}

async function signRefreshToken(userId) {
  const token = jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
  );
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await RefreshToken.create({ user_id: userId, token, expires_at: expiresAt });
  return token;
}

// BE-03: POST /auth/send-otp
async function sendOtp(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { email } = req.body;
  const otp = generateOtp();
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  // Invalidate previous OTPs for this email
  await OtpToken.update({ used: true }, { where: { email, used: false } });
  await OtpToken.create({ email, otp, expires_at: expiresAt });

  try {
    await sendOtpEmail(email, otp);
    res.json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error('Mailer error:', err.message);
    res.status(500).json({ error: 'Failed to send OTP email' });
  }
}

// BE-04: POST /auth/register
async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { name, email, password, otp } = req.body;

  const otpRecord = await OtpToken.findOne({
    where: { email, otp, used: false },
    order: [['created_at', 'DESC']],
  });

  if (!otpRecord || otpRecord.expires_at < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const user = await User.create({
    name,
    email,
    password_hash: password, // hook will hash it
    is_verified: true,
  });

  await otpRecord.update({ used: true });

  const accessToken = signAccessToken(user);
  const refreshToken = await signRefreshToken(user.id);

  res.status(201).json({
    message: 'Registration successful',
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  });
}

// BE-05: POST /auth/login
async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const accessToken = signAccessToken(user);
  const refreshToken = await signRefreshToken(user.id);

  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  });
}

// BE-10: POST /auth/refresh
async function refreshToken(req, res) {
  const { refreshToken: token } = req.body;
  if (!token) return res.status(400).json({ error: 'Refresh token required' });

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const record = await RefreshToken.findOne({
      where: { user_id: decoded.id, token, revoked: false },
    });

    if (!record || record.expires_at < new Date()) {
      return res.status(401).json({ error: 'Refresh token invalid or expired' });
    }

    const user = await User.findByPk(decoded.id);
    const newAccessToken = signAccessToken(user);
    res.json({ accessToken: newAccessToken });
  } catch {
    res.status(401).json({ error: 'Refresh token invalid' });
  }
}

// GET /auth/me
async function getMe(req, res) {
  const user = await User.findByPk(req.user.id, {
    attributes: ['id', 'name', 'email', 'role', 'department', 'phone'],
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
}

// PATCH /auth/profile
async function updateProfile(req, res) {
  const { name, department, phone } = req.body;
  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (name) user.name = name;
  if (department !== undefined) user.department = department;
  if (phone !== undefined) user.phone = phone;
  await user.save();
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, department: user.department, phone: user.phone });
}

// PATCH /auth/change-password
async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' });
  if (newPassword.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  const user = await User.findByPk(req.user.id);
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }
  user.password_hash = await bcrypt.hash(newPassword, 12);
  await user.save();
  res.json({ message: 'Password updated successfully' });
}

// GET /auth/technicians — admin only
async function getTechnicians(req, res) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const techs = await User.findAll({
    where: { role: 'technician' },
    attributes: ['id', 'name', 'email', 'department'],
  });
  res.json(techs);
}

module.exports = { sendOtp, register, login, refreshToken, getMe, getTechnicians, updateProfile, changePassword };
