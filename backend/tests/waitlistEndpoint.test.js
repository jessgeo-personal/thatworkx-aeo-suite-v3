import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

vi.mock('../models/WaitlistSignup.js', () => {
  return {
    default: class MockWaitlistSignup {
      constructor(data) {
        Object.assign(this, data);
      }
      async save() {
        return { _id: 'mock_waitlist_id_101', ...this, createdAt: new Date() };
      }
    }
  };
});

describe('POST /api/waitlist - AI Optimize Pro Pipeline', () => {
  let app;

  beforeEach(async () => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ inlineMessage: 'Submission received' })
    });

    const waitlistController = await import('../controllers/waitlistController.js');
    app = express();
    app.use(express.json());
    app.post('/api/waitlist', waitlistController.handleWaitlistSubmission);
  });

  it('rejects submissions with missing required fields with 400', async () => {
    const res = await request(app)
      .post('/api/waitlist')
      .send({ firstName: 'Marcus', email: 'marcus@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/missing required fields/i);
  });

  it('rejects invalid email formatting with 400', async () => {
    const res = await request(app)
      .post('/api/waitlist')
      .send({
        firstName: 'Marcus',
        lastName: 'Vance',
        email: 'invalid-email-address',
        phone: '+15550192834',
        country: 'United States'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/invalid email/i);
  });

  it('saves valid submission to MongoDB and dispatches to HubSpot', async () => {
    const payload = {
      firstName: 'Elena',
      lastName: 'Rostova',
      email: 'elena.rostova@enterprise.io',
      phone: '+14155552671',
      country: 'United States',
      tier: 'AI Optimize Pro'
    };

    const res = await request(app)
      .post('/api/waitlist')
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('elena.rostova@enterprise.io');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
