process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'test-refresh-secret';

jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}));

jest.mock('../models', () => ({
  User: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  OtpToken: {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  },
  RefreshToken: {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  },
  StaffSkill: {
    findAll: jest.fn(),
  },
}));

jest.mock('../config/database', () => ({ sequelize: {} }));
jest.mock('../config/mailer', () => ({ sendOtpEmail: jest.fn() }));
jest.mock('../config/firebase', () => ({
  admin: { auth: () => ({ verifyIdToken: jest.fn() }) },
  db: {},
}));

const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { register, verifyOtp, login, logout } = require('../controllers/auth.controller');
const { User, OtpToken, RefreshToken } = require('../models');
const { sendOtpEmail } = require('../config/mailer');

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
  };
}

describe('auth.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    validationResult.mockReturnValue({ isEmpty: () => true });
  });

  it('registers a user and generates an OTP', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ id: 'u-1' });
    OtpToken.create.mockResolvedValue({ id: 'otp-1' });
    sendOtpEmail.mockResolvedValue();

    const req = { body: { name: 'Test Student', email: 'student@campus.edu', password: 'Password123' } };
    const res = createRes();

    await register(req, res);

    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ email: 'student@campus.edu', is_verified: false }));
    expect(OtpToken.create).toHaveBeenCalledWith(expect.objectContaining({ email: 'student@campus.edu' }));
    expect(sendOtpEmail).toHaveBeenCalledWith('student@campus.edu', expect.any(String));
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('verifies OTP and issues tokens', async () => {
    const otpUpdate = jest.fn().mockResolvedValue();
    const userSave = jest.fn().mockResolvedValue();

    OtpToken.findOne.mockResolvedValue({ expires_at: new Date(Date.now() + 60000), update: otpUpdate });
    User.findOne.mockResolvedValue({
      id: 'u-1',
      name: 'Test Student',
      email: 'student@campus.edu',
      role: 'student',
      is_verified: false,
      save: userSave,
    });
    RefreshToken.create.mockResolvedValue({ id: 'refresh-1' });

    const req = { body: { email: 'student@campus.edu', otp: '123456' } };
    const res = createRes();

    await verifyOtp(req, res);

    expect(userSave).toHaveBeenCalled();
    expect(otpUpdate).toHaveBeenCalledWith({ used: true });
    expect(res.cookie).toHaveBeenCalledWith('refreshToken', expect.any(String), expect.any(Object));
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ accessToken: expect.any(String) }));
  });

  it('logs a verified user in and rotates refresh tokens', async () => {
    User.findOne.mockResolvedValue({
      id: 'u-2',
      name: 'Admin User',
      email: 'admin@campus.edu',
      role: 'admin',
      is_verified: true,
      status: 'active',
      department: 'IT',
      phone: '1234567890',
      comparePassword: jest.fn().mockResolvedValue(true),
    });
    RefreshToken.create.mockResolvedValue({ id: 'refresh-2' });

    const req = { body: { email: 'admin@campus.edu', password: 'Password123' } };
    const res = createRes();

    await login(req, res);

    expect(res.cookie).toHaveBeenCalledWith('refreshToken', expect.any(String), expect.any(Object));
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      user: expect.objectContaining({ email: 'admin@campus.edu', role: 'admin' }),
      accessToken: expect.any(String),
    }));
  });

  it('logs out and revokes the current refresh token when present', async () => {
    RefreshToken.update.mockResolvedValue([1]);

    const req = {
      cookies: {
        refreshToken: jwt.sign({ id: 'u-2' }, process.env.REFRESH_TOKEN_SECRET),
      },
    };
    const res = createRes();

    await logout(req, res);

    expect(RefreshToken.update).toHaveBeenCalledWith({ revoked: true }, expect.objectContaining({ where: expect.any(Object) }));
    expect(res.clearCookie).toHaveBeenCalledWith('refreshToken', expect.any(Object));
    expect(res.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
  });
});