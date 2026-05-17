const { createTicket, addFeedback } = require('../controllers/ticket.controller');

jest.mock('../models/Ticket', () => ({
  Ticket: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  }
}));

jest.mock('../services/assignment.service', () => ({ autoAssignTechnician: jest.fn() }));
jest.mock('../services/firebase.service', () => ({ syncTicketToFeed: jest.fn() }));
jest.mock('../services/sla.service', () => ({ scheduleSLA: jest.fn() }));
jest.mock('../services/notification.service', () => ({ createNotification: jest.fn() }));
jest.mock('../config/socket', () => ({ getIO: () => null }));

const { Ticket } = require('../models/Ticket');

describe('ticket.controller unit tests', () => {
  afterEach(() => jest.clearAllMocks());

  test('createTicket returns 409 on duplicate', async () => {
    Ticket.findOne.mockResolvedValue({ id: 'dup-1' });

    const req = { body: { title: 'X', description: 'Y', category: 'wifi', location: 'L' }, user: { id: 'u1' }, file: null };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await createTicket(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
  });

  test('createTicket creates ticket when no duplicate', async () => {
    Ticket.findOne.mockResolvedValue(null);
    Ticket.create.mockResolvedValue({ id: 't-1', title: 'T1' });

    const req = { body: { title: 'T1', description: 'D', category: 'wifi', location: 'L' }, user: { id: 'u1' }, file: null };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await createTicket(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 't-1' }));
  });

  test('addFeedback returns 404 when ticket not found', async () => {
    Ticket.findByPk.mockResolvedValue(null);
    const req = { params: { id: 't-x' }, body: { rating: 5 }, user: { id: 'u1' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await addFeedback(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
