const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 4000;

// app.use(cors());
// ✅ CORS Configuration
app.use(cors({
  origin: 'http://localhost:5173', // exact frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());


const studentsRoutes = require('./routes/students');
const contestsRoutes = require('./routes/contests');
const syncRoutes = require('./routes/sync');
const cronService = require('./services/cronService');
console.log('studentsRoutes:', typeof studentsRoutes);
console.log('contestsRoutes:', typeof contestsRoutes);
console.log('syncRoutes:', typeof syncRoutes);

const problemUpdateService = require('./services/problemUpdateService');

// Middleware
// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));





// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codeforces-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  // Start cron jobs
  cronService.startSyncJob();
  cronService.startInactivityCheck();
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Routes
app.use('/api/students', studentsRoutes);
app.use('/api/contests', contestsRoutes);
app.use('/api/sync', syncRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}
problemUpdateService.startUpdateJob();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  cronService.stopAllJobs();
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  cronService.stopAllJobs();
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;