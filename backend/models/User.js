const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password_hash: {
    type: String,
    default: ''
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
