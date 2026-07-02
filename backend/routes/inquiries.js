const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');

// POST /api/inquiries - Public: Submit inquiry
router.post('/', async (req, res) => {
  try {
    const inquiry = await Inquiry.create({
      ...req.body,
      ipAddress: req.ip
    });
    res.status(201).json({ success: true, message: 'Inquiry submitted successfully!', data: inquiry });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// (Admin endpoints removed) Only public POST remains

module.exports = router;
