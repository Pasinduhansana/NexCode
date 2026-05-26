const express = require('express');
const router = express.Router();
const ShowcaseProject = require('../models/ShowcaseProject');
const { protect } = require('../middleware/auth');

const normalizeProject = (body) => ({
  slug: String(body.slug || body.name || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  name: body.name,
  type: body.type,
  summary: body.summary,
  stack: Array.isArray(body.stack) ? body.stack : String(body.stack || '').split(',').map(item => item.trim()).filter(Boolean),
  results: Array.isArray(body.results) ? body.results : String(body.results || '').split(',').map(item => item.trim()).filter(Boolean),
  color: body.color || 'from-blue-600 to-cyan-500',
  image: body.image || '',
  order: Number(body.order || 0),
  active: body.active !== false && body.active !== 'false',
});

router.get('/', protect, async (req, res) => {
  try {
    const projects = await ShowcaseProject.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const project = await ShowcaseProject.create(normalizeProject(req.body));
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.patch('/:id', protect, async (req, res) => {
  try {
    const project = await ShowcaseProject.findByIdAndUpdate(req.params.id, normalizeProject(req.body), { new: true });
    if (!project) return res.status(404).json({ success: false, message: 'Showcase project not found' });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await ShowcaseProject.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Showcase project deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;