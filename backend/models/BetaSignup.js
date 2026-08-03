const mongoose = require('mongoose');

const BetaSignupSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  sourceTool: {
    type: String,
    enum: ['visualize', 'optimize', 'socialize'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('BetaSignup', BetaSignupSchema);
