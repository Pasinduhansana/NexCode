const express = require('express');
const router = express.Router();
const ShowcaseProject = require('../models/ShowcaseProject');

// GET /api/showcase - Public showcase list
router.get('/', async (req, res) => {
  try {
    const projects = await ShowcaseProject.find({ active: true }).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;