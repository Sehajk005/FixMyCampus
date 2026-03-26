/**
 * Fix My Campus — Smoke Tests (GIT-06, GIT-07)
 * Tests: auth flow + ticket round-trip with JWT
 */

const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../config/database');
const { User } = require('../models/User');
const { OtpToken } = require('../models/OtpToken');
const { Ticket } = require('../models/Ticket');
const { Message } = require('../models/Message');
const { RefreshToken } = require('../models/RefreshToken');

let accessToken;
let testUserId;
let testTicketId;

beforeAll(async () => {
  // Sync all models to test DB
  await sequelize.sync({ force: true });

  // Create a pre-verified test user
  const user = await User.create({
    name: 'Test Student',
    email: 'test@chitkara.edu',
    password_hash: 'TestPass@123',
    is_verified: true,
    role: 'student',
  });
  testUserId = user.id;

  // Pre-create a valid OTP for registration test
  await OtpToken.create({
    email: 'newuser@chitkara.edu',
    otp: '123456',
    expires_at: new Date(Date.now() + 10 * 60 * 1000),
  });
});

afterAll(async () => {
  await sequelize.close();
});

// ─── Auth Tests ──────────────────────────────────────────────────────────────

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /auth/login', () => {
  it('returns JWT for valid credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@chitkara.edu', password: 'TestPass@123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user.email).toBe('test@chitkara.edu');
    accessToken = res.body.accessToken;
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@chitkara.edu', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });
});

describe('GET /auth/me', () => {
  it('returns user profile with valid JWT', async () => {
    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('test@chitkara.edu');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.status).toBe(401);
  });
});

// ─── Ticket Tests (GIT-07) ───────────────────────────────────────────────────

describe('POST /tickets', () => {
  it('creates a ticket with valid JWT', async () => {
    const res = await request(app)
      .post('/tickets')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Wi-Fi not working in Lab 3',
        description: 'Cannot connect since morning',
        category: 'wifi',
        location: 'Block A - Lab 3',
        priority: 'high',
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.category).toBe('wifi');
    testTicketId = res.body.id;
  });

  it('returns 401 without JWT', async () => {
    const res = await request(app).post('/tickets').send({
      title: 'Test', description: 'Test', category: 'wifi', location: 'Block A',
    });
    expect(res.status).toBe(401);
  });
});

describe('GET /tickets/mine', () => {
  it('returns tickets for authenticated user', async () => {
    const res = await request(app)
      .get('/tickets/mine')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].submitter_id).toBe(testUserId);
  });
});

describe('GET /tickets/:id', () => {
  it('returns ticket detail with submitter', async () => {
    const res = await request(app)
      .get(`/tickets/${testTicketId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(testTicketId);
    expect(res.body.submitter).toHaveProperty('name');
  });
});
