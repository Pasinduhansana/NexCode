const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  clientName: { type: String, required: true, trim: true },
  clientEmail: { type: String, required: true, lowercase: true },
  clientPhone: { type: String },
  projectTitle: { type: String, required: true },
  projectType: {
    type: String,
    enum: ['Web Development', 'Mobile App', 'Custom Software', 'UI/UX Design', 'Cloud Solution', 'AI & Automation', 'Database System', 'Other'],
    required: true
  },
  description: { type: String, required: true },
  features: [{ type: String }],
  timeline: { type: String, enum: ['1-2 weeks', '1 month', '2-3 months', '3-6 months', '6+ months', 'Flexible'], default: 'Flexible' },
  budget: { type: String },
  techPreferences: { type: String },
  status: { type: String, enum: ['pending', 'under-review', 'quoted', 'approved', 'in-progress', 'completed', 'rejected'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  quotedAmount: { type: Number },
  adminNotes: { type: String },
  attachments: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
