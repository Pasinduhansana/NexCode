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
    await seedShowcase();
  })
  .catch(err => console.error('❌ MongoDB Error:', err));


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
app.use('/api/inquiries', require('./routes/inquiries'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/showcase', require('./routes/showcase'));


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
