const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// POST /api/projects - Public: Submit project request
router.post('/', async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, message: 'Project request submitted successfully!', data: project });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// (Admin endpoints removed) Only public POST remains

module.exports = router;
