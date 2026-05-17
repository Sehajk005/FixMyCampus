process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'test-refresh-secret';

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('../../backend/node_modules/supertest');
const app = require('../../backend/app');
const { sequelize } = require('../../backend/models');

test.before(async () => {
  await sequelize.sync({ force: true });
});

test.after(async () => {
  await sequelize.close();
});

test('health endpoint returns the service status payload', async () => {
  const response = await request(app).get('/api/health');

  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'ok');
  assert.equal(response.body.service, 'Fix My Campus API');
});