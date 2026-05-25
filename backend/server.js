const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected');
    await seedAdmin();
    await seedShowcase();
  })
  .catch(err => console.error('❌ MongoDB Error:', err));

// Seed Admin User
const seedAdmin = async () => {
  const Admin = require('./models/Admin');
  const bcrypt = require('bcryptjs');
  const existing = await Admin.findOne({ email: process.env.ADMIN_SEED_EMAIL });
  if (!existing) {
    const hashed = await bcrypt.hash(process.env.ADMIN_SEED_PASSWORD, 12);
    await Admin.create({
      name: 'NexCode Admin',
      email: process.env.ADMIN_SEED_EMAIL,
      password: hashed,
      role: 'superadmin'
    });
    console.log('✅ Admin seeded:', process.env.ADMIN_SEED_EMAIL);
  }
};

const seedShowcase = async () => {
  const ShowcaseProject = require('./models/ShowcaseProject');
  const showcaseSeed = require('./seed/showcaseProjects');
  const existingCount = await ShowcaseProject.countDocuments();
  if (existingCount === 0 && showcaseSeed.length > 0) {
    await ShowcaseProject.insertMany(showcaseSeed);
    console.log(`✅ Showcase seeded: ${showcaseSeed.length} projects`);
  }
};

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/inquiries', require('./routes/inquiries'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/showcase', require('./routes/showcase'));
app.use('/api/admin/showcase', require('./routes/adminShowcase'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'NexCode API Running', time: new Date() }));

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 NexCode Server running on port ${PORT}`));
