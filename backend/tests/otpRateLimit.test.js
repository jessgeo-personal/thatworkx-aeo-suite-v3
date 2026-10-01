import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// In-memory store mock for OTP records
let mockOtpStore = new Map();

vi.mock('../services/emailService.js', () => ({
  sendOtpEmail: vi.fn().mockResolvedValue({ success: true, id: 'mock_resend_id' })
}));

vi.mock('../models/Otp.js', () => {
  return {
    default: {
      findOne: vi.fn().mockImplementation(async ({ email }) => {
        return mockOtpStore.get(email.toLowerCase()) || null;
      }),
      findOneAndUpdate: vi.fn().mockImplementation(async ({ email }, update, options) => {
        const key = email.toLowerCase();
        const existing = mockOtpStore.get(key) || {};
        const updated = {
          ...existing,
          email: key,
          code: update.code || update.$set?.code || existing.code,
          updatedAt: update.updatedAt || update.$set?.updatedAt || new Date(),
          expiresAt: update.expiresAt || update.$set?.expiresAt || new Date(Date.now() + 10 * 60 * 1000)
        };
        mockOtpStore.set(key, updated);
        return updated;
      })
    }
  };
});

describe('POST /api/auth/send-otp - Double-Dispatch Cooldown & Race Condition Protection', () => {
  let app;
  let emailService;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockOtpStore.clear();

    emailService = await import('../services/emailService.js');

    // Dynamically resolve auth controller
    const authController = await import('../controllers/authController.js');
    const sendOtpHandler = authController.sendOtp || authController.requestOtp || authController.handleSendOtp;

    app = express();
    app.use(express.json());
    app.post('/api/auth/send-otp', sendOtpHandler);
  });

  it('rejects concurrent double-requests within cooldown and calls email delivery strictly ONCE', async () => {
    const testEmail = 'founder@enterprise.com';

    // Dispatch two requests concurrently
    const [res1, res2] = await Promise.all([
      request(app).post('/api/auth/send-otp').send({ email: testEmail }),
      request(app).post('/api/auth/send-otp').send({ email: testEmail })
    ]);

    // First request should succeed
    expect(res1.status).toBe(200);
    expect(res1.body.success).toBe(true);

    // Second concurrent request must either be rate-limited (429) or return an idempotent warning (200) without sending an email
    if (res2.status === 429) {
      expect(res2.body.success).toBe(false);
      expect(res2.body.error).toMatch(/wait|cooldown|rate limit/i);
    } else {
      expect(res2.status).toBe(200);
      expect(res2.body.message).toMatch(/already dispatched|inbox|wait/i);
    }

    // Critical assertion: Email dispatch service must be invoked strictly ONCE
    expect(emailService.sendOtpEmail).toHaveBeenCalledTimes(1);
  });

  it('allows a new OTP request only after the 60-second cooldown expires', async () => {
    const testEmail = 'founder@enterprise.com';

    // Seed expired record (70 seconds ago)
    mockOtpStore.set(testEmail, {
      email: testEmail,
      code: '123456',
      updatedAt: new Date(Date.now() - 70 * 1000),
      expiresAt: new Date(Date.now() + 8 * 60 * 1000)
    });

    const res = await request(app)
      .post('/api/auth/send-otp')
      .send({ email: testEmail });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(emailService.sendOtpEmail).toHaveBeenCalledTimes(1);
  });
});
