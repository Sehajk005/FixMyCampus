const { assignTechnician } = require('../controllers/ticket.controller');

jest.mock('../services/assignment.service', () => ({ manualAssign: jest.fn() }));
jest.mock('../services/sla.service', () => ({ scheduleSLA: jest.fn() }));
jest.mock('../services/firebase.service', () => ({ updateTicketInFeed: jest.fn() }));
jest.mock('../services/notification.service', () => ({ createNotification: jest.fn() }));
jest.mock('../config/socket', () => ({ getIO: () => null }));

describe('admin.controller unit tests', () => {
  afterEach(() => jest.clearAllMocks());

  test('assignTechnician returns 400 when technicianId missing', async () => {
    const req = { params: { id: 't-1' }, body: {}, user: { role: 'admin' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await assignTechnician(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
  });
});
