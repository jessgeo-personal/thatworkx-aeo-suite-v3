const crypto = require('crypto');
const User = require('../models/User');

// Helper to hash passwords using SHA256
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password + 'thatworkx-salt-2026').digest('hex');
};

// Helper to generate auth session token
const generateToken = (user) => {
  const payload = {
    email: user.email,
    tier: user.subscription_tier,
    issuedAt: Date.now()
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

// Register Controller
const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    let existingUser = await User.findOne({ email });
    if (existingUser && existingUser.password_hash) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const passHash = hashPassword(password);

    if (existingUser) {
      existingUser.password_hash = passHash;
      await existingUser.save();
      const token = generateToken(existingUser);
      return res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        token,
        user: {
          email: existingUser.email,
          subscription_tier: existingUser.subscription_tier
        }
      });
    }

    const newUser = new User({
      email,
      password_hash: passHash,
      subscription_tier: 'AIVisualize Free'
    });

    await newUser.save();
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        email: newUser.email,
        subscription_tier: newUser.subscription_tier
      }
    });

  } catch (err) {
    console.error('Registration Controller Error:', err);
    res.status(500).json({ error: 'Internal registration server error' });
  }
};

// Login Controller
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passHash = hashPassword(password);
    if (user.password_hash !== passHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Authenticated successfully',
      token,
      user: {
        email: user.email,
        subscription_tier: user.subscription_tier
      }
    });

  } catch (err) {
    console.error('Login Controller Error:', err);
    res.status(500).json({ error: 'Internal login server error' });
  }
};

// Current Session Controller
const getCurrentUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.json({ authenticated: false, tier: 'AIVisualize Free' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
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

module.exports = { registerUser, loginUser, getCurrentUser };
