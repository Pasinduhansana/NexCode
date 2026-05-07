const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const Project = require('../models/Project');
const Contact = require('../models/Contact');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const { protect, superAdminOnly } = require('../middleware/auth');

// GET /api/admin/analytics
router.get('/analytics', protect, async (req, res) => {
  try {
    const [
      totalInquiries, newInquiries, totalProjects, pendingProjects,
      totalContacts, unreadContacts, convertedInquiries
    ] = await Promise.all([
      Inquiry.countDocuments(),
      Inquiry.countDocuments({ status: 'new' }),
      Project.countDocuments(),
      Project.countDocuments({ status: 'pending' }),
      Contact.countDocuments(),
      Contact.countDocuments({ status: 'unread' }),
      Inquiry.countDocuments({ status: 'converted' })
    ]);

    // Monthly data for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyInquiries = await Inquiry.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const serviceBreakdown = await Inquiry.aggregate([
      { $group: { _id: '$service', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalInquiries, newInquiries, totalProjects, pendingProjects,
        totalContacts, unreadContacts, convertedInquiries,
        conversionRate: totalInquiries > 0 ? ((convertedInquiries / totalInquiries) * 100).toFixed(1) : 0,
        monthlyInquiries, serviceBreakdown
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/create - superadmin only
router.post('/create', protect, superAdminOnly, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Admin already exists' });
    const hashed = await bcrypt.hash(password, 12);
    const admin = await Admin.create({ name, email, password: hashed, role: role || 'admin' });
    res.status(201).json({ success: true, data: { id: admin._id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
