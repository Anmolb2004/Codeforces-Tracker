// routes/contests.js
const express = require('express');
const router = express.Router();
const Contest = require('../models/Contest');
const Submission = require('../models/Submission');

// Get all contests
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, type } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (type) {
      query.type = type;
    }
    
    const contests = await Contest.find(query)
      .sort({ startTimeSeconds: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Contest.countDocuments(query);
    
    res.json({
      contests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get contest by ID
router.get('/:contestId', async (req, res) => {
  try {
    const contest = await Contest.findOne({ contestId: req.params.contestId });
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }
    res.json(contest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get contest standings for tracked students
router.get('/:contestId/standings', async (req, res) => {
  try {
    const contestId = req.params.contestId;
    
    const standings = await Submission.aggregate([
      {
        $match: {
          contestId: parseInt(contestId),
          ratingChange: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$cfHandle',
          rank: { $first: '$rank' },
          ratingChange: { $first: '$ratingChange' },
          problemsSolved: {
            $sum: {
              $cond: [{ $eq: ['$verdict', 'OK'] }, 1, 0]
            }
          },
          totalSubmissions: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: 'cfHandle',
          as: 'student'
        }
      },
      {
        $unwind: '$student'
      },
      {
        $sort: { rank: 1 }
      }
    ]);
    
    res.json(standings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codeforces-tracker', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

// middleware/auth.js
const rateLimit = require('express-rate-limit');

// Rate limiting middleware
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General API rate limit
const apiLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many requests from this IP, please try again later.'
);

// Strict rate limit for sync operations
const syncLimiter = createRateLimit(
  60 * 1000, // 1 minute
  5, // limit each IP to 5 sync requests per minute
  'Too many sync requests, please wait before trying again.'
);

// Student creation rate limit
const createStudentLimiter = createRateLimit(
  60 * 1000, // 1 minute
  10, // limit each IP to 10 student creations per minute
  'Too many student creation requests, please wait before trying again.'
);

// Validation middleware
const validateStudent = (req, res, next) => {
  const { name, cfHandle, email } = req.body;
  
  if (!name || !cfHandle || !email) {
    return res.status(400).json({ 
      error: 'Name, Codeforces handle, and email are required' 
    });
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'Please provide a valid email address' 
    });
  }
  
  // Basic CF handle validation (alphanumeric and underscore only)
  const handleRegex = /^[a-zA-Z0-9_]+$/;
  if (!handleRegex.test(cfHandle)) {
    return res.status(400).json({ 
      error: 'Codeforces handle can only contain letters, numbers, and underscores' 
    });
  }
  
  next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ error: errors.join(', ') });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ 
      error: `${field} already exists` 
    });
  }
  
  // Default error
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
};

module.exports = {
  apiLimiter,
  syncLimiter,
  createStudentLimiter,
  validateStudent,
  errorHandler
};

module.exports = router;