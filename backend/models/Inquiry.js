const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true },
  phone: { type: String, trim: true },
  company: { type: String, trim: true },
  service: {
    type: String,
    enum: ['Web Development', 'Mobile App Development', 'Custom Software Development', 'UI/UX Design', 'Cloud Solutions', 'AI & Automation Solutions', 'Database & System Development', 'Other'],
    default: 'Other'
  },
  message: { type: String, required: true },
  budget: { type: String, enum: ['Under $1K', '$1K-$5K', '$5K-$15K', '$15K-$50K', '$50K+', 'Not Sure'], default: 'Not Sure' },
  status: { type: String, enum: ['new', 'in-review', 'contacted', 'converted', 'closed'], default: 'new' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  adminNotes: { type: String },
  ipAddress: { type: String },
  source: { type: String, default: 'website' }
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
