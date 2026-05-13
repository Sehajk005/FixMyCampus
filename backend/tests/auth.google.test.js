jest.mock('../config/firebase', () => {
  const mockVerifyIdToken = jest.fn();
  const authInstance = { verifyIdToken: mockVerifyIdToken };
  return {
    admin: {
      auth: () => authInstance,
    },
  };
});

const request = require('supertest');
const { admin } = require('../config/firebase');
const mockVerifyIdToken = admin.auth().verifyIdToken;

const app = require('../app');
const { sequelize } = require('../config/database');
const { User } = require('../models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

beforeEach(() => {
  mockVerifyIdToken.mockReset();
});

describe('POST /auth/google', () => {
  it('returns 400 when idToken is missing', async () => {
    const res = await request(app)
      .post('/auth/google')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/idToken required/i);
  });

  it('returns 401 when Firebase token is invalid', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('Firebase: invalid token'));

    const res = await request(app)
      .post('/auth/google')
      .send({ idToken: 'bad-token' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid google token/i);
  });

  it('returns 401 when Google email is not verified', async () => {
    mockVerifyIdToken.mockResolvedValue({
      email: 'unverified@campus.edu',
      name: 'Unverified User',
      uid: 'uid-unverified',
      email_verified: false,
    });

    const res = await request(app)
      .post('/auth/google')
      .send({ idToken: 'unverified-token' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/not verified/i);
  });

  it('creates a new student and returns accessToken', async () => {
    mockVerifyIdToken.mockResolvedValue({
      email: 'newstudent@campus.edu',
      name: 'New Student',
      uid: 'uid-new-001',
      email_verified: true,
    });

    const res = await request(app)
      .post('/auth/google')
      .send({ idToken: 'valid-token-new' });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('newstudent@campus.edu');
    expect(res.body.user.role).toBe('student');
    expect(res.body.user.is_verified).toBe(true);
    expect(res.body.accessToken).toBeDefined();
  });

  it('links google_uid to an existing student account with the same email', async () => {
    await User.create({
      name: 'Existing Student',
      email: 'existing@campus.edu',
      password_hash: 'some-hashed-pw',
      is_verified: true,
      role: 'student',
    });

    mockVerifyIdToken.mockResolvedValue({
      email: 'existing@campus.edu',
      name: 'Existing Student',
      uid: 'uid-link-002',
      email_verified: true,
    });

    const res = await request(app)
      .post('/auth/google')
      .send({ idToken: 'valid-token-link' });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('existing@campus.edu');

    const user = await User.findOne({ where: { email: 'existing@campus.edu' } });
    expect(user.google_uid).toBe('uid-link-002');
  });

  it('returns 403 when email belongs to a technician', async () => {
    await User.create({
      name: 'Tech User',
      email: 'tech@campus.edu',
      password_hash: 'some-hashed-pw',
      is_verified: true,
      role: 'technician',
    });

    mockVerifyIdToken.mockResolvedValue({
      email: 'tech@campus.edu',
      name: 'Tech User',
      uid: 'uid-tech-003',
      email_verified: true,
    });

    const res = await request(app)
      .post('/auth/google')
      .send({ idToken: 'tech-token' });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/email\/password/i);
  });

  it('returns 403 when email belongs to an admin', async () => {
    await User.create({
      name: 'Admin User',
      email: 'admin@campus.edu',
      password_hash: 'some-hashed-pw',
      is_verified: true,
      role: 'admin',
    });

    mockVerifyIdToken.mockResolvedValue({
      email: 'admin@campus.edu',
      name: 'Admin User',
      uid: 'uid-admin-004',
      email_verified: true,
    });

    const res = await request(app)
      .post('/auth/google')
      .send({ idToken: 'admin-token' });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/email\/password/i);
  });

  it('returns 403 when the account is deactivated', async () => {
    await User.create({
      name: 'Inactive Student',
      email: 'inactive@campus.edu',
      google_uid: 'uid-inactive-005',
      is_verified: true,
      role: 'student',
      status: 'inactive',
    });

    mockVerifyIdToken.mockResolvedValue({
      email: 'inactive@campus.edu',
      name: 'Inactive Student',
      uid: 'uid-inactive-005',
      email_verified: true,
    });

    const res = await request(app)
      .post('/auth/google')
      .send({ idToken: 'inactive-token' });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/deactivated/i);
  });
});
