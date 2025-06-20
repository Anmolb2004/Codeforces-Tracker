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