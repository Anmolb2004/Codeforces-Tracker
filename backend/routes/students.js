const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Submission = require('../models/Submission');
const EmailLog = require('../models/EmailLog');
const codeforcesService = require('../services/codeforcesService');

// Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find({}).sort({ name: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single student
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

// FIXED: Fast problem stats using stored data
router.get('/:id/problems', async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 30 } = req.query;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    // OPTIMIZATION: Use simple queries instead of complex aggregation
    // Get recent accepted submissions count (for the time period)
    const recentSolved = await Submission.countDocuments({
      cfHandle: student.cfHandle,
      verdict: 'OK',
      submissionTimeSeconds: { $gte: Math.floor(daysAgo.getTime() / 1000) }
    });

    // Get recent submission activity for heatmap
    const recentSubmissions = await Submission.find({
      cfHandle: student.cfHandle,
      submissionTimeSeconds: { $gte: Math.floor(daysAgo.getTime() / 1000) }
    }).select('submissionTimeSeconds verdict');

    // Process submission activity efficiently
    const submissionActivity = {};
    recentSubmissions.forEach(sub => {
      const date = new Date(sub.submissionTimeSeconds * 1000);
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      submissionActivity[dateStr] = (submissionActivity[dateStr] || 0) + 1;
    });

    // Get some recent problems for display (limit to 10 for speed)
    const recentProblems = await Submission.find({
      cfHandle: student.cfHandle,
      verdict: 'OK',
      submissionTimeSeconds: { $gte: Math.floor(daysAgo.getTime() / 1000) }
    })
    .select('contestId problemIndex problemName problemRating problemTags submissionTimeSeconds')
    .sort({ submissionTimeSeconds: -1 })
    .limit(10);

    // Calculate basic stats
    const averagePerDay = recentSolved / parseInt(days);
    const averageRating = recentProblems.reduce((sum, p) => sum + (p.problemRating || 0), 0) / recentProblems.length || 0;
    
    const hardestProblem = recentProblems.reduce((max, p) => 
      (p.problemRating || 0) > (max.problemRating || 0) ? p : max, 
      { problemRating: 0 }
    );

    res.json({
      // Use stored totalSolved instead of calculating
      totalSolved: student.totalSolved || 0,
      totalSolvedAllTime: student.totalSolved || 0,
      recentSolved,
      averageRating,
      averagePerDay,
      hardestProblem: hardestProblem.problemRating ? hardestProblem : null,
      submissionActivity,
      recentProblems: recentProblems.map(p => ({
        contestId: p.contestId,
        index: p.problemIndex,
        name: p.problemName,
        rating: p.problemRating,
        tags: p.problemTags,
        solvedAt: p.submissionTimeSeconds
      }))
    });

  } catch (error) {
    console.error('Error getting problem stats:', error);
    res.status(500).json({ error: 'Failed to get problem statistics' });
  }
});

// OPTIMIZED: Fast total solved calculation using CF API
async function getFastTotalSolved(cfHandle) {
  try {
    // Method 1: Use stored value if recently updated
    const student = await Student.findOne({ cfHandle });
    if (student && student.lastDataSync && 
        (Date.now() - student.lastDataSync.getTime()) < 3600000) { // 1 hour
      return student.totalSolved || 0;
    }

    // Method 2: Quick API call to get user info (includes solved count)
    const userInfo = await codeforcesService.fetchUserInfo(cfHandle);
    
    // Update student record with fresh data
    if (student) {
      student.totalSolved = userInfo.rating ? await getAccurateSolvedCount(cfHandle) : 0;
      student.lastDataSync = new Date();
      await student.save();
      return student.totalSolved;
    }

    return 0;
  } catch (error) {
    console.error('Error getting fast total solved:', error);
    return 0;
  }
}

// Helper to get accurate solved count when needed
async function getAccurateSolvedCount(cfHandle) {
  try {
    const acceptedSubmissions = await Submission.distinct('problemId', {
      cfHandle: cfHandle,
      verdict: 'OK'
    });
    return acceptedSubmissions.length;
  } catch (error) {
    console.error('Error getting accurate solved count:', error);
    return 0;
  }
}

// IMPROVED: Add new student with immediate response
router.post('/', async (req, res) => {
  try {
    const { name, cfHandle, email, phoneNumber } = req.body;
    
    // Basic validation
    if (!name || !cfHandle || !email) {
      return res.status(400).json({ error: 'Name, CF handle, and email are required' });
    }
    
    // Check if CF handle exists (quick validation)
    let userInfo;
    try {
      userInfo = await codeforcesService.fetchUserInfo(cfHandle);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid Codeforces handle' });
    }
    
    // Create student with CF data (fast response)
    const student = new Student({
      name,
      cfHandle,
      email,
      phoneNumber: phoneNumber || "",
      currentRating: userInfo.rating || 0,
      maxRating: userInfo.maxRating || 0,
      rank: userInfo.rank || 'unrated',
      totalSolved: 0, // Will be updated in background
      lastDataSync: new Date()
    });

    await student.save();
    
    // Return immediately
    res.status(201).json(student);
    
    // Update totalSolved in background (don't wait)
    setImmediate(async () => {
      try {
        const totalSolved = await getFastTotalSolved(cfHandle);
        student.totalSolved = totalSolved;
        await student.save();
        console.log(`Background update: ${student.name} - ${totalSolved} problems solved`);
      } catch (error) {
        console.error(`Background update failed for ${student.name}:`, error.message);
      }
    });
    
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phoneNumber, cfHandle } = req.body;
    
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Update fields
    if (name) student.name = name;
    if (email) student.email = email;
    if (phoneNumber !== undefined) student.phoneNumber = phoneNumber;
    
    // If CF handle changed, validate and update
    if (cfHandle && cfHandle !== student.cfHandle) {
      const userInfo = await codeforcesService.fetchUserInfo(cfHandle);
      
      student.cfHandle = cfHandle;
      student.currentRating = userInfo.rating || 0;
      student.maxRating = userInfo.maxRating || 0;
      student.rank = userInfo.rank || 'unrated';
      student.totalSolved = 0; // Will be updated
      student.lastDataSync = new Date();
      
      // Update totalSolved in background
      setImmediate(async () => {
        try {
          const totalSolved = await getFastTotalSolved(cfHandle);
          await Student.findByIdAndUpdate(student._id, { totalSolved });
        } catch (error) {
          console.error('Background update error:', error);
        }
      });
    }

    await student.save();
    res.json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await Submission.deleteMany({ cfHandle: student.cfHandle });
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update CF handle
router.put('/:id/handle', async (req, res) => {
  try {
    const { cfHandle } = req.body;
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const userInfo = await codeforcesService.fetchUserInfo(cfHandle);
    
    student.cfHandle = cfHandle;
    student.currentRating = userInfo.rating || 0;
    student.maxRating = userInfo.maxRating || 0;
    student.rank = userInfo.rank || 'unrated';
    student.totalSolved = 0;
    student.lastDataSync = new Date();
    
    await student.save();
    
    // Update totalSolved in background
    setImmediate(async () => {
      try {
        const totalSolved = await getFastTotalSolved(cfHandle);
        await Student.findByIdAndUpdate(student._id, { totalSolved });
      } catch (error) {
        console.error('Background update error:', error);
      }
    });
    
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

// Get student profile data (FAST VERSION)
router.get('/:id/profile', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Parallel queries for speed
    const [emailCount] = await Promise.all([
      EmailLog.countDocuments({
        studentId: student._id,
        emailType: 'inactivity_reminder'
      })
    ]);

    res.json({
      student,
      emailReminderCount: emailCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get contest history (OPTIMIZED)
router.get('/:id/contests', async (req, res) => {
  try {
    const { days = 365 } = req.query;
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const daysAgo = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);
    
    // Optimized query - get contest data directly
    const contests = await Submission.find({
      cfHandle: student.cfHandle,
      submissionTimeSeconds: { $gte: daysAgo.getTime() / 1000 },
      ratingChange: { $ne: null }
    })
    .select('contestId contestName ratingChange rank submissionTimeSeconds')
    .sort({ submissionTimeSeconds: -1 })
    .limit(50); // Limit for performance

    // Get rating progression efficiently
    const ratingHistory = contests.map(contest => ({
      time: contest.submissionTimeSeconds * 1000,
      ratingChange: contest.ratingChange,
      contestName: contest.contestName
    }));

    let currentRating = student.currentRating;
    const ratingProgression = ratingHistory.reverse().map(entry => {
      const rating = currentRating;
      currentRating -= entry.ratingChange;
      return {
        time: entry.time,
        rating: rating,
        contestName: entry.contestName
      };
    }).reverse();

    res.json({
      contests: contests.map(c => ({
        contestId: c.contestId,
        contestName: c.contestName,
        ratingChange: c.ratingChange,
        rank: c.rank,
        submissionTime: c.submissionTimeSeconds
      })),
      ratingProgression
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// OPTIMIZED: Batch update all students
router.post('/sync-all', async (req, res) => {
  try {
    const students = await Student.find({});
    let updated = 0;
    
    // Process in batches for better performance
    const batchSize = 5;
    for (let i = 0; i < students.length; i += batchSize) {
      const batch = students.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (student) => {
        try {
          const totalSolved = await getFastTotalSolved(student.cfHandle);
          await Student.findByIdAndUpdate(student._id, { 
            totalSolved,
            lastDataSync: new Date()
          });
          updated++;
        } catch (error) {
          console.error(`Failed to update ${student.name}:`, error.message);
        }
      }));
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < students.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    res.json({ message: `Updated ${updated} students` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;