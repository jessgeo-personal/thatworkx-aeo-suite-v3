const User = require('../models/User');

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

// Request Registration OTP (New User registration & deduplication check)
const requestRegisterOtp = async (req, res) => {
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
    const expiry = new Date(Date.now() + 10 * 60000); // 10 minutes from now

    if (user) {
      // Update unverified user registration details
      user.person = { first_name, last_name, phone_number, country: country || '' };
      user.organization = { company_name: company || '' };
      user.otp_code = otp;
      user.otp_expires_at = expiry;
      await user.save();
    } else {
      // Create new unverified user profile
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

    console.log(`\n[OTP MAIL SIMULATOR] Sent OTP code: ${otp} to email address: ${email}\n`);

    res.status(200).json({
      success: true,
      message: 'OTP sent to email address successfully.',
      dev_otp: otp
    });
  } catch (err) {
    console.error('Request Registration OTP Error:', err);
    res.status(500).json({ error: 'Internal server error during registration request.' });
  }
};

// Request Login OTP (Old user email check and OTP send)
const requestLoginOtp = async (req, res) => {
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
    const expiry = new Date(Date.now() + 10 * 60000); // 10 minutes from now

    user.otp_code = otp;
    user.otp_expires_at = expiry;
    await user.save();

    console.log(`\n[OTP MAIL SIMULATOR] Sent OTP code: ${otp} to email address: ${email}\n`);

    res.status(200).json({
      success: true,
      message: 'Verification OTP sent to email successfully.',
      dev_otp: otp
    });
  } catch (err) {
    console.error('Request Login OTP Error:', err);
    res.status(500).json({ error: 'Internal server error during login request.' });
  }
};

// Verify OTP (Confirm verification, set is_verified = true, issue Bearer token)
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email address and OTP code are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    // Validate OTP matches and is not expired
    if (!user.otp_code || user.otp_code !== otp.toString().trim()) {
      return res.status(401).json({ error: 'Invalid verification OTP code. Please try again.' });
    }

    if (user.otp_expires_at && new Date() > user.otp_expires_at) {
      return res.status(401).json({ error: 'Verification OTP code has expired. Please request a new code.' });
    }

    // Set user as verified, clear OTP code
    user.is_verified = true;
    user.otp_code = '';
    user.otp_expires_at = null;
    await user.save();

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. Authentication complete.',
      token,
      user: {
        email: user.email,
        subscription_tier: user.subscription_tier,
        person: user.person,
        organization: user.organization
      }
    });
  } catch (err) {
    console.error('Verify OTP Error:', err);
    res.status(500).json({ error: 'Internal server error during OTP verification.' });
  }
};

// Keep placeholders for backward compatibility
const registerUser = requestRegisterOtp;
const loginUser = requestLoginOtp;

const getCurrentUser = async (req, res) => {
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
};

module.exports = {
  requestRegisterOtp,
  requestLoginOtp,
  verifyOtp,
  registerUser,
  loginUser,
  getCurrentUser
};
