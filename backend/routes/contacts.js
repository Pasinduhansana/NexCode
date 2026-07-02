const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// POST /api/contacts - Public
router.post('/', async (req, res) => {
  try {
    const contact = await Contact.create({ ...req.body, ipAddress: req.ip });
    res.status(201).json({ success: true, message: 'Message sent successfully!', data: contact });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// (Admin endpoints removed) Only public POST remains

module.exports = router;
