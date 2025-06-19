const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const studentsRouter = require('./routes/students');
const contestsRouter = require('./routes/contests');
const syncRouter = require('./routes/sync');

app.use('/api/students', studentsRouter);
app.use('/api/contests', contestsRouter);
app.use('/api/sync', syncRouter);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codeforces-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  // Start cron jobs
  require('./services/cronService').startSyncJob();
  require('./services/cronService').startInactivityCheck();
  require('./services/problemUpdateService').startUpdateJob();
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  require('./services/cronService').stopAllJobs();
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  require('./services/cronService').stopAllJobs();
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;