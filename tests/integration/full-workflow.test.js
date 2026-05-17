process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'test-refresh-secret';

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('../../backend/node_modules/supertest');
const app = require('../../backend/app');
const { sequelize, User, OtpToken, Ticket, StaffSkill } = require('../../backend/models');

test.before(async () => {
  await sequelize.sync({ force: true });
});

test.after(async () => {
  await sequelize.close();
});

test('student registration, OTP verification, ticket creation, assignment, and feedback workflow', async () => {
  await User.create({
    name: 'Campus Admin',
    email: 'admin@campus.edu',
    password_hash: 'AdminPass123',
    role: 'admin',
    is_verified: true,
    status: 'active',
  });

  const technician = await User.create({
    name: 'Tech One',
    email: 'tech@campus.edu',
    password_hash: 'TechPass123',
    role: 'technician',
    is_verified: true,
    status: 'active',
  });

  await StaffSkill.create({
    user_id: technician.id,
    skill_tag: 'wifi',
    availability: true,
    current_workload: 0,
    max_capacity: 4,
  });

  const registerResponse = await request(app)
    .post('/auth/register')
    .send({
      name: 'Student One',
      email: 'student@campus.edu',
      password: 'StudentPass123',
    });

  assert.equal(registerResponse.status, 201);

  const otpRecord = await OtpToken.findOne({ where: { email: 'student@campus.edu' } });
  assert.ok(otpRecord);

  const verifyResponse = await request(app)
    .post('/auth/otp/verify')
    .send({ email: 'student@campus.edu', otp: otpRecord.otp });

  assert.equal(verifyResponse.status, 200);
  const studentToken = verifyResponse.body.accessToken;

  const ticketResponse = await request(app)
    .post('/tickets')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({
      title: 'Wi-Fi is down in Lab 2',
      description: 'The access point keeps dropping connections.',
      category: 'wifi',
      location: 'Block A - Lab 2',
      priority: 'high',
    });

  assert.equal(ticketResponse.status, 201);
  assert.ok(ticketResponse.body.id);
  assert.equal(ticketResponse.body.assigned_to, technician.id);

  const mineResponse = await request(app)
    .get('/tickets/mine')
    .set('Authorization', `Bearer ${studentToken}`);

  assert.equal(mineResponse.status, 200);
  assert.equal(mineResponse.body.length, 1);
  assert.equal(mineResponse.body[0].title, 'Wi-Fi is down in Lab 2');

  const detailResponse = await request(app)
    .get(`/tickets/${ticketResponse.body.id}`)
    .set('Authorization', `Bearer ${studentToken}`);

  assert.equal(detailResponse.status, 200);
  assert.equal(detailResponse.body.submitter.email, 'student@campus.edu');

  const adminLogin = await request(app)
    .post('/auth/login')
    .send({ email: 'admin@campus.edu', password: 'AdminPass123' });

  assert.equal(adminLogin.status, 200);

  const resolvedResponse = await request(app)
    .patch(`/tickets/${ticketResponse.body.id}`)
    .set('Authorization', `Bearer ${adminLogin.body.accessToken}`)
    .send({ status: 'resolved' });

  assert.equal(resolvedResponse.status, 200);
  assert.equal(resolvedResponse.body.status, 'resolved');

  const feedbackResponse = await request(app)
    .post(`/tickets/${ticketResponse.body.id}/feedback`)
    .set('Authorization', `Bearer ${studentToken}`)
    .send({ rating: 5, comment: 'Fixed quickly.' });

  assert.equal(feedbackResponse.status, 201);
  assert.equal(feedbackResponse.body.rating, 5);

  const updatedTicket = await Ticket.findByPk(ticketResponse.body.id);
  assert.equal(updatedTicket.status, 'resolved');
  assert.equal(updatedTicket.assigned_to, technician.id);
});