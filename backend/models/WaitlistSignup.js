import mongoose from 'mongoose';

const waitlistSignupSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  tier: { type: String, default: 'AI Optimize Pro' },
  status: { type: String, enum: ['WAITLISTED', 'INVITED', 'CONVERTED'], default: 'WAITLISTED' },
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

const WaitlistSignup = mongoose.models.WaitlistSignup || mongoose.model('WaitlistSignup', waitlistSignupSchema);
export default WaitlistSignup;
