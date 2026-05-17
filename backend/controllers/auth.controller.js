const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { User, OtpToken, RefreshToken, StaffSkill } = require('../models');
const { sequelize } = require('../config/database');
const { sendOtpEmail } = require('../config/mailer');
const { admin } = require('../config/firebase');

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set');
}

if (!REFRESH_TOKEN_SECRET) {
  throw new Error('REFRESH_TOKEN_SECRET must be set');
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
}

async function signRefreshToken(userId) {
  const token = jwt.sign(
    { id: userId },
    REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
  );
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await RefreshToken.create({ user_id: userId, token, expires_at: expiresAt });
  return token;
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

async function resendOtp(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.is_verified) return res.status(400).json({ error: 'User already verified' });

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

async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { name, email, password } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  await User.create({
    name,
    email,
    password_hash: password, // hook will hash it
    is_verified: false,
  });

  const otp = generateOtp();
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  await OtpToken.create({ email, otp, expires_at: expiresAt });

  try {
    await sendOtpEmail(email, otp);
  } catch (err) {
    console.error('Failed to send OTP email during register:', err.message);
  }

  res.status(201).json({ message: 'Registration successful, OTP sent' });
}

async function verifyOtp(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { email, otp } = req.body;

  const otpRecord = await OtpToken.findOne({
    where: { email, otp, used: false },
    order: [['created_at', 'DESC']],
  });

  if (!otpRecord || otpRecord.expires_at < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.is_verified = true;
  await user.save();
  await otpRecord.update({ used: true });

  const accessToken = signAccessToken(user);
  const refreshToken = await signRefreshToken(user.id);

  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.json({
    message: 'OTP verified successfully',
    user: { id: user.id, name: user.name, email: user.email, role: user.role, is_verified: user.is_verified },
    accessToken,
  });
}

async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (user.status !== 'active') {
    return res.status(403).json({ error: 'Account has been deactivated' });
  }

  if (!user.is_verified) {
    return res.status(403).json({ error: 'Email not verified' });
  }

  const accessToken = signAccessToken(user);
  const refreshToken = await signRefreshToken(user.id);

  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, is_verified: user.is_verified, department: user.department, phone: user.phone },
    accessToken,
  });
}

async function refreshToken(req, res) {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: 'Refresh token required' });

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || 'refreshsecret123');
    const record = await RefreshToken.findOne({
      where: { user_id: decoded.id, token, revoked: false },
    });

    if (!record || record.expires_at < new Date()) {
      return res.status(401).json({ error: 'Refresh token invalid or expired' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user || user.status !== 'active') {
      return res.status(403).json({ error: 'Account has been deactivated' });
    }
    const newAccessToken = signAccessToken(user);
    const newRefreshToken = await signRefreshToken(user.id);

    // Optional: revoke old refresh token manually to avoid buildup (rotation)
    await record.update({ revoked: true });

    res.cookie('refreshToken', newRefreshToken, cookieOptions);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(401).json({ error: 'Refresh token invalid' });
  }
}

async function logout(req, res) {
  const token = req.cookies.refreshToken;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || 'refreshsecret123');
      await RefreshToken.update({ revoked: true }, { where: { user_id: decoded.id, token } });
    } catch (err) {
      // Ignored if token invalid
    }
  }
  res.clearCookie('refreshToken', cookieOptions);
  res.json({ message: 'Logged out successfully' });
}

// GET /auth/me
async function getMe(req, res) {
  const user = await User.findByPk(req.user.id, {
    attributes: ['id', 'name', 'email', 'role', 'department', 'phone', 'status'],
  });
  if (!user || user.status !== 'active') return res.status(403).json({ error: 'Account has been deactivated' });
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

async function getMySkills(req, res) {
  if (req.user.role !== 'technician') {
    return res.status(403).json({ error: 'Only technicians have skills' });
  }
  try {
    const skills = await StaffSkill.findAll({ where: { user_id: req.user.id } });
    res.json(skills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateMySkills(req, res) {
  if (req.user.role !== 'technician') {
    return res.status(403).json({ error: 'Only technicians have skills' });
  }

  const { skills } = req.body; // Array of { skill_tag, availability, max_capacity }
  
  if (!Array.isArray(skills)) {
    return res.status(400).json({ error: 'Skills must be an array' });
  }

  const t = await sequelize.transaction();

  try {
    const existingSkills = await StaffSkill.findAll({ 
      where: { user_id: req.user.id },
      transaction: t 
    });
    
    // Map existing skills by tag
    const existingMap = {};
    for (const skill of existingSkills) {
      existingMap[skill.skill_tag] = skill;
    }

    const tagsInRequest = new Set();

    for (const s of skills) {
      if (!s.skill_tag) continue;
      tagsInRequest.add(s.skill_tag);

      const existing = existingMap[s.skill_tag];
      if (existing) {
        // Update existing skill, preserving current_workload
        await existing.update({
          availability: s.availability !== undefined ? s.availability : existing.availability,
          max_capacity: s.max_capacity !== undefined ? s.max_capacity : existing.max_capacity
        }, { transaction: t });
      } else {
        // Create new skill
        await StaffSkill.create({
          user_id: req.user.id,
          skill_tag: s.skill_tag,
          availability: s.availability !== undefined ? s.availability : true,
          max_capacity: s.max_capacity !== undefined ? s.max_capacity : 5,
          current_workload: 0 // New skills have 0 workload
        }, { transaction: t });
      }
    }

    // Identify tags to remove (they were existing, but not in request)
    // Only remove them if workload is 0, else they should probably just be marked unavailable?
    // Wait, simpler to just delete them regardless. But deleting active skill might mess up logic.
    // Let's delete them. If they had active workload, well they shouldn't just disappear. 
    for (const existing of existingSkills) {
      if (!tagsInRequest.has(existing.skill_tag)) {
        await existing.destroy({ transaction: t });
      }
    }

    await t.commit();
    res.json({ message: 'Skills updated successfully' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
}

async function googleAuth(req, res) {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: 'idToken required' });

  let decoded;
  try {
    decoded = await admin.auth().verifyIdToken(idToken);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid Google token' });
  }

  const { email, name, uid, email_verified } = decoded;

  if (!email_verified) {
    return res.status(401).json({ error: 'Google email not verified' });
  }

  let user = await User.findOne({ where: { email } });

  if (user) {
    if (user.role === 'admin' || user.role === 'technician') {
      return res.status(403).json({ error: 'Admins and technicians must use email/password' });
    }
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account has been deactivated' });
    }
    if (!user.google_uid) {
      user.google_uid = uid;
    }
    user.is_verified = true;
    await user.save();
  } else {
    user = await User.create({
      name: name || email.split('@')[0],
      email,
      google_uid: uid,
      is_verified: true,
      password_hash: null,
    });
  }

  const accessToken = signAccessToken(user);
  const refreshToken = await signRefreshToken(user.id);
  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, is_verified: user.is_verified },
    accessToken,
  });
}

module.exports = {
  resendOtp,
  register,
  verifyOtp,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  changePassword,
  getTechnicians,
  getMySkills,
  updateMySkills,
  googleAuth,
};
