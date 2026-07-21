const mongoose = require('mongoose');

const ScanLogSchema = new mongoose.Schema({
  user_email: {
    type: String,
    required: true
  },
  target_url: {
    type: String,
    required: true
  },
  scan_timestamp: {
    type: Date,
    default: Date.now
  },
  page_depth_budget: {
    type: Number,
    required: true
  },
  pages_actually_crawled: {
    type: Number,
    required: true
  },
  headless_session_executed: {
    type: Boolean,
    default: false
  },
  score_achieved: {
    type: Number,
    required: true
  },
  visibility_classification: {
    type: String,
    enum: ['Good', 'Bad', 'Ugly'],
    required: true
  }
});

module.exports = mongoose.model('ScanLog', ScanLogSchema);
