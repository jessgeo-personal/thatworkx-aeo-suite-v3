const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  subscription_tier: {
    type: String,
    enum: [
      'AIVisualize Free',
      'AIVisualize Pro',
      'AIVisualize ENT',
      'AIOptimize Free',
      'AIOptimize Pro',
      'AIOptimize ENT'
    ],
    default: 'AIVisualize Free'
  },
  daily_scans_performed: {
    type: Number,
    default: 0
  },
  daily_headless_runs_performed: {
    type: Number,
    default: 0
  },
  last_active_date: {
    type: Date,
    default: Date.now
  },

  // OTP auth details
  otp_code: {
    type: String,
    default: ''
  },
  otp_expires_at: {
    type: Date,
    default: null
  },
  is_verified: {
    type: Boolean,
    default: false
  },

  // Stripe compatible custom fields
  person: {
    first_name: { type: String, default: '' },
    last_name: { type: String, default: '' },
    phone_number: { type: String, default: '' },
    country: { type: String, default: '' }
  },
  organization: {
    company_name: { type: String, default: '' }
  },
  notification: {
    email_alerts: { type: Boolean, default: true },
    sms_alerts: { type: Boolean, default: false }
  },
  subscription: {
    stripe_customer_id: { type: String, default: '' },
    stripe_subscription_id: { type: String, default: '' },
    status: { type: String, default: 'inactive' } // active, trialing, past_due, canceled, inactive
  }
});

// Helper method to reset daily limits if date changes (UTC boundary check)
UserSchema.methods.checkAndResetDailyLimits = function() {
  const now = new Date();
  const lastActive = new Date(this.last_active_date);

  // If calendar date (UTC) differs, reset counts
  if (
    now.getUTCFullYear() !== lastActive.getUTCFullYear() ||
    now.getUTCMonth() !== lastActive.getUTCMonth() ||
    now.getUTCDate() !== lastActive.getUTCDate()
  ) {
    this.daily_scans_performed = 0;
    this.daily_headless_runs_performed = 0;
    this.last_active_date = now;
    return true;
  }
  return false;
};

module.exports = mongoose.model('User', UserSchema);
