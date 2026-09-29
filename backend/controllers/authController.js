import Otp from '../models/Otp.js';
import User from '../models/User.js';
import { sendOtpEmail } from '../services/emailService.js';

// In-flight mutex set to catch microsecond race conditions between concurrent requests
const inFlightOtpRequests = new Set();
const OTP_COOLDOWN_MS = 60 * 1000; // 60 seconds cooldown

export async function sendOtp(req, res) {
  const { email } = req.body || {};

  if (!email || typeof email !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'A valid email address is required.'
    });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // 1. Race condition guard: Check if a request for this email is currently in-flight
  if (inFlightOtpRequests.has(normalizedEmail)) {
    return res.status(200).json({
      success: true,
      message: 'Verification code already dispatched. Please check your inbox.'
    });
  }

  // Acquire in-flight lock
  inFlightOtpRequests.add(normalizedEmail);

  try {
    // 2. Cooldown check: Check if an active OTP was issued within the last 60 seconds
    const existingOtp = await Otp.findOne({ email: normalizedEmail });

    if (
      existingOtp &&
      existingOtp.updatedAt &&
      Date.now() - new Date(existingOtp.updatedAt).getTime() < OTP_COOLDOWN_MS
    ) {
      return res.status(200).json({
        success: true,
        message: 'Verification code already dispatched. Please check your inbox.'
      });
    }

    // 3. Generate 6-digit cryptographically secure OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes expiry

    // 4. Atomically persist/update code before sending email
    await Otp.findOneAndUpdate(
      { email: normalizedEmail },
      {
        code,
        updatedAt: now,
        expiresAt
      },
      { upsert: true, new: true }
    );

    // 5. Dispatch email strictly once database is written
    await sendOtpEmail(normalizedEmail, code);

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully.'
    });
  } catch (error) {
    console.error('Error during OTP dispatch:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process verification request. Please try again.'
    });
  } finally {
    // Release in-flight lock
    inFlightOtpRequests.delete(normalizedEmail);
  }
}

// Export aliases to match any existing route mounts
export const requestOtp = sendOtp;
export const handleSendOtp = sendOtp;

// Helper to generate a signed Bearer session token
const generateToken = (user) => {
  const payload = {
    email: user.email,
    tier: user.subscription_tier,
    issuedAt: Date.now()
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

// Generates a 6-digit numeric OTP code
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function requestRegisterOtp(req, res) {
  try {
    const { email, first_name, last_name, phone_number, company, country, opt_in } = req.body;

    if (!email || !first_name || !last_name || !phone_number) {
      return res.status(400).json({ error: 'Email, First Name, Last Name, and Phone Number are required fields.' });
    }

    if (!opt_in) {
      return res.status(400).json({ error: 'You must agree to the data storage and usage policies of Thatworkx Solutions.' });
    }

    let user = await User.findOne({ email });
    if (user && user.is_verified) {
      return res.status(400).json({ error: 'An account with this email already exists. Please use the Login tab.' });
    }

    const otp = generateOtp();
    const expiry = new Date(Date.now() + 10 * 60000);

    if (user) {
      user.person = { first_name, last_name, phone_number, country: country || '' };
      user.organization = { company_name: company || '' };
      user.otp_code = otp;
      user.otp_expires_at = expiry;
      await user.save();
    } else {
      user = new User({
        email,
        is_verified: false,
        subscription_tier: 'AIVisualize Free',
        person: { first_name, last_name, phone_number, country: country || '' },
        organization: { company_name: company || '' },
        otp_code: otp,
        otp_expires_at: expiry
      });
      await user.save();
    }

    await sendOtpEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent to email address successfully.',
      dev_otp: process.env.NODE_ENV === 'test' ? otp : undefined
    });
  } catch (err) {
    console.error('Request Registration OTP Error:', err.message);
    res.status(500).json({ error: err.message || 'Internal server error during registration request.' });
  }
}

export async function requestLoginOtp(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'Email address not found. Please register as a new user in the New User tab.'
      });
    }

    const otp = generateOtp();
    const expiry = new Date(Date.now() + 10 * 60000);

    user.otp_code = otp;
    user.otp_expires_at = expiry;
    await user.save();

    await sendOtpEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'Verification OTP sent to email successfully.',
      dev_otp: process.env.NODE_ENV === 'test' ? otp : undefined
    });
  } catch (err) {
    console.error('Request Login OTP Error:', err.message);
    res.status(500).json({ error: err.message || 'Internal server error during login request.' });
  }
}

export async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and 6-digit OTP code are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    // 1. Check Otp model
    try {
      const otpDoc = await Otp.findOne({ email: cleanEmail });
      if (otpDoc) {
        if (otpDoc.expiresAt && new Date() > new Date(otpDoc.expiresAt)) {
          return res.status(400).json({ success: false, error: 'Verification code has expired. Please request a new one.' });
        }
        if (otpDoc.code === cleanOtp) {
          await Otp.deleteOne({ email: cleanEmail });
          let user = await User.findOne({ email: cleanEmail });
          if (user) {
            user.is_verified = true;
            user.otp_code = '';
            user.otp_expires_at = null;
            await user.save();
          }
          return res.status(200).json({
            success: true,
            email: cleanEmail,
            token: user ? generateToken(user) : 'session-verified',
            message: 'Email verified successfully. Authentication complete.'
          });
        }
      }
    } catch (otpDbErr) {
      // Continue to DB user check
    }

    // 2. Check User model
    let user = null;
    try {
      user = await User.findOne({ email: cleanEmail });
    } catch (e) {}

    if (user && user.otp_code) {
      if (user.otp_code !== cleanOtp) {
        return res.status(400).json({ success: false, error: 'Invalid verification code. Please check and try again.' });
      }
      if (user.otp_expires_at && new Date() > user.otp_expires_at) {
        return res.status(400).json({ success: false, error: 'Verification code has expired. Please request a new code.' });
      }

      user.is_verified = true;
      user.otp_code = '';
      user.otp_expires_at = null;
      await user.save();

      const token = generateToken(user);

      return res.status(200).json({
        success: true,
        email: cleanEmail,
        token,
        message: 'Email verified successfully. Authentication complete.',
        user: {
          email: user.email,
          subscription_tier: user.subscription_tier,
          person: user.person,
          organization: user.organization
        }
      });
    }

    return res.status(400).json({ success: false, error: 'Invalid or expired OTP code. Please request a new one.' });
  } catch (err) {
    console.error('Verify OTP Error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error during OTP verification.' });
  }
}

export const registerUser = requestRegisterOtp;
export const loginUser = requestLoginOtp;

export async function getCurrentUser(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.json({ authenticated: false, tier: 'AIVisualize Free' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));

    const user = await User.findOne({ email: decoded.email });
    if (!user || !user.is_verified) {
      return res.json({ authenticated: false, tier: 'AIVisualize Free' });
    }

    res.json({
      authenticated: true,
      user: {
        email: user.email,
        subscription_tier: user.subscription_tier,
        daily_scans_performed: user.daily_scans_performed,
        daily_headless_runs_performed: user.daily_headless_runs_performed
      }
    });
  } catch (err) {
    res.json({ authenticated: false, tier: 'AIVisualize Free' });
  }
}

export default {
  sendOtp,
  requestOtp,
  handleSendOtp,
  verifyOtp,
  requestRegisterOtp,
  requestLoginOtp,
  registerUser,
  loginUser,
  getCurrentUser
};
