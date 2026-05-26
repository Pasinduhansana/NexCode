const mongoose = require('mongoose');

const showcaseProjectSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true, trim: true },
  summary: { type: String, required: true, trim: true },
  stack: [{ type: String, trim: true }],
  results: [{ type: String, trim: true }],
  color: { type: String, default: 'from-blue-600 to-cyan-500' },
  image: { type: String, default: '' },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('ShowcaseProject', showcaseProjectSchema);