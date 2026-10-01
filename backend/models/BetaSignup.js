import mongoose from 'mongoose';

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

const BetaSignup = mongoose.models.BetaSignup || mongoose.model('BetaSignup', BetaSignupSchema);
export default BetaSignup;
