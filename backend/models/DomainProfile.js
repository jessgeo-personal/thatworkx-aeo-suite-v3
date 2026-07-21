const mongoose = require('mongoose');

const DomainProfileSchema = new mongoose.Schema({
  domain_name: {
    type: String,
    required: true,
    unique: true
  },
  is_secure_ssl: {
    type: Boolean,
    default: true
  },
  robots_txt_exists: {
    type: Boolean,
    default: false
  },
  llms_txt_exists: {
    type: Boolean,
    default: false
  },
  ai_context_exists: {
    type: Boolean,
    default: false
  },
  sitemap_url: {
    type: String,
    default: ''
  },
  total_pages_discovered: {
    type: Number,
    default: 0
  },
  last_audited: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DomainProfile', DomainProfileSchema);
