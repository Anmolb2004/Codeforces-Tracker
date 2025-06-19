const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Submission = require('../models/Submission');
const EmailLog = require('../models/Emaillog');
const codeforcesService = require('../services/codeforcesService');
const problemController = require('../services/problemController');

// Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find({}).sort({ name: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/problems', problemController.getProblemStats);


// Add new student
router.post('/', async (req, res) => {
  try {
    const { name, cfHandle, email, phoneNumber } = req.body;
    
    // Check if CF handle exists
    const userInfo = await codeforcesService.fetchUserInfo(cfHandle);
    
    const student = new Student({
      name,
      cfHandle,
      email,
      phoneNumber: phoneNumber || "", // This ensures empty string if undefined
      currentRating: userInfo.rating || 0,
      maxRating: userInfo.maxRating || 0,
      rank: userInfo.rank || 'unrated'
    });

    await student.save();
    await codeforcesService.syncStudentData(student);
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update student (PUT)
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phoneNumber, cfHandle } = req.body;
    
    // Find student
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Update fields
    if (name) student.name = name;
    if (email) student.email = email;
    if (phoneNumber !== undefined) student.phoneNumber = phoneNumber;
    
    // If CF handle changed, validate and sync
    if (cfHandle && cfHandle !== student.cfHandle) {
      const userInfo = await codeforcesService.fetchUserInfo(cfHandle);
      student.cfHandle = cfHandle;
      student.currentRating = userInfo.rating || 0;
      student.maxRating = userInfo.maxRating || 0;
      student.rank = userInfo.rank || 'unrated';
      await codeforcesService.syncStudentData(student);
    }

    await student.save();
    res.json(student);
    
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete student (DELETE)
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Optional: Also delete related submissions
    await Submission.deleteMany({ cfHandle: student.cfHandle });
    
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update student CF handle
router.put('/:id/handle', async (req, res) => {
  try {
    const { cfHandle } = req.body;
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Validate new CF handle
    await codeforcesService.fetchUserInfo(cfHandle);
    
    student.cfHandle = cfHandle;
    await student.save();
    
    // Sync data immediately with new handle
    await codeforcesService.syncStudentData(student);
    
    res.json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Toggle email reminders
router.put('/:id/email-reminders', async (req, res) => {
  try {
    const { enabled } = req.body;
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { emailRemindersEnabled: enabled },
      { new: true }
    );
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Get student profile data
router.get('/:id/profile', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get email reminder count
    const emailCount = await EmailLog.countDocuments({
      studentId: student._id,
      emailType: 'inactivity_reminder'
    });

    res.json({
      student,
      emailReminderCount: emailCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Get contest history
router.get('/:id/contests', async (req, res) => {
  try {
    const { days = 365 } = req.query;
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const daysAgo = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);
    
    const contests = await Submission.aggregate([
      {
        $match: {
          cfHandle: student.cfHandle,
          submissionTimeSeconds: { $gte: daysAgo.getTime() / 1000 },
          ratingChange: { $ne: null }
        }
      },
      {
        $sort: { submissionTimeSeconds: -1 }
      },
      {
        $group: {
          _id: '$contestId',
          contestName: { $first: '$contestName' },
          ratingChange: { $first: '$ratingChange' },
          rank: { $first: '$rank' },
          submissionTime: { $first: '$submissionTimeSeconds' },
          problemsSolved: {
            $sum: {
              $cond: [{ $eq: ['$verdict', 'OK'] }, 1, 0]
            }
          },
          totalProblems: { $first: '$totalProblems' }
        }
      },
      {
        $project: {
          _id: 1,
          contestName: 1,
          ratingChange: 1,
          rank: 1,
          submissionTime: 1,
          problemsSolved: 1,
          totalProblems: {
            $ifNull: ['$totalProblems', 6] // Fallback to 6 if null
          }
        }
      },
      {
        $sort: { submissionTime: -1 }
      }
    ]);

    // Get rating progression
    const ratingHistory = await Submission.find({
      cfHandle: student.cfHandle,
      ratingChange: { $ne: null },
      submissionTimeSeconds: { $gte: daysAgo.getTime() / 1000 }
    })
    .select('submissionTimeSeconds ratingChange')
    .sort({ submissionTimeSeconds: 1 });

    let currentRating = student.currentRating;
    const ratingProgression = ratingHistory.reverse().map(entry => {
      const rating = currentRating;
      currentRating -= entry.ratingChange;
      return {
        time: entry.submissionTimeSeconds * 1000,
        rating: rating
      };
    }).reverse();

    res.json({
      contests,
      ratingProgression
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get problem solving data
router.get('/:id/problems', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const daysAgo = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);
    
    // Get solved problems in the time range
    const solvedProblems = await Submission.find({
      cfHandle: student.cfHandle,
      verdict: 'OK',
      submissionTimeSeconds: { $gte: daysAgo.getTime() / 1000 }
    }).sort({ submissionTimeSeconds: -1 });

    // Remove duplicates (same problem solved multiple times)
    const uniqueProblems = [];
    const seen = new Set();
    
    for (const problem of solvedProblems) {
      const key = `${problem.contestId}-${problem.problemIndex}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueProblems.push(problem);
      }
    }

    // Calculate stats
    const totalSolved = uniqueProblems.length;
    const averageRating = uniqueProblems.reduce((sum, p) => sum + (p.problemRating || 0), 0) / totalSolved || 0;
    const averagePerDay = totalSolved / parseInt(days);
    const hardestProblem = uniqueProblems.reduce((max, p) => 
      (p.problemRating || 0) > (max.problemRating || 0) ? p : max, 
      uniqueProblems[0] || {}
    );

    // Rating distribution
    const ratingBuckets = {
      '800-1000': 0,
      '1000-1200': 0,
      '1200-1400': 0,
      '1400-1600': 0,
      '1600-1800': 0,
      '1800-2000': 0,
      '2000+': 0,
      'Unrated': 0
    };

    uniqueProblems.forEach(problem => {
      const rating = problem.problemRating;
      if (!rating) {
        ratingBuckets['Unrated']++;
      } else if (rating < 1000) {
        ratingBuckets['800-1000']++;
      } else if (rating < 1200) {
        ratingBuckets['1000-1200']++;
      } else if (rating < 1400) {
        ratingBuckets['1200-1400']++;
      } else if (rating < 1600) {
        ratingBuckets['1400-1600']++;
      } else if (rating < 1800) {
        ratingBuckets['1600-1800']++;
      } else if (rating < 2000) {
        ratingBuckets['1800-2000']++;
      } else {
        ratingBuckets['2000+']++;
      }
    });

    // Submission heatmap data
    const heatmapData = {};
    const allSubmissions = await Submission.find({
      cfHandle: student.cfHandle,
      submissionTimeSeconds: { $gte: daysAgo.getTime() / 1000 }
    });

    allSubmissions.forEach(submission => {
      const date = new Date(submission.submissionTimeSeconds * 1000).toISOString().split('T')[0];
      heatmapData[date] = (heatmapData[date] || 0) + 1;
    });

    res.json({
      totalSolved,
      averageRating: Math.round(averageRating),
      averagePerDay: Math.round(averagePerDay * 100) / 100,
      hardestProblem,
      ratingBuckets,
      heatmapData,
      problems: uniqueProblems.slice(0, 50) // Limit for performance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;