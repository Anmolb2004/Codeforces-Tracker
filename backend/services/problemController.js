const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const Student = require('../models/Student');

const problemController = {
  getProblemStats: async (req, res) => {
    try {
      const { id } = req.params;
      const { days = 30 } = req.query;

      const student = await Student.findById(id);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days));

      // Get all accepted submissions in the time range
      const submissions = await Submission.find({
        cfHandle: student.cfHandle,
        verdict: 'OK',
        submissionTimeSeconds: { $gte: Math.floor(daysAgo.getTime() / 1000) }
      }).sort({ submissionTimeSeconds: -1 });

      // Get unique problems solved
      const uniqueProblems = [];
      const seenProblems = new Set();

      submissions.forEach(sub => {
        const problemKey = `${sub.contestId}-${sub.problemIndex}`;
        if (!seenProblems.has(problemKey)) {
          seenProblems.add(problemKey);
          uniqueProblems.push({
            contestId: sub.contestId,
            index: sub.problemIndex,
            name: sub.problemName,
            rating: sub.problemRating,
            tags: sub.problemTags,
            solvedAt: sub.submissionTimeSeconds
          });
        }
      });

      // Calculate statistics
      const totalSolved = uniqueProblems.length;
      const averageRating = uniqueProblems.reduce((sum, p) => sum + (p.rating || 0), 0) / totalSolved || 0;
      const averagePerDay = totalSolved / parseInt(days);
      
      // Find hardest problem (highest rating)
      const hardestProblem = uniqueProblems.reduce((max, p) => 
        (p.rating || 0) > (max.rating || 0) ? p : max, 
        { rating: 0 }
      );

      // Create rating distribution (grouped by 100s)
      const ratingDistribution = {};
      uniqueProblems.forEach(problem => {
        if (problem.rating) {
          const bucket = Math.floor(problem.rating / 100) * 100;
          ratingDistribution[bucket] = (ratingDistribution[bucket] || 0) + 1;
        }
      });

      // Get ALL submissions for heatmap (not just accepted ones)
      const allSubmissions = await Submission.find({
        cfHandle: student.cfHandle,
        submissionTimeSeconds: { $gte: Math.floor(daysAgo.getTime() / 1000) }
      });

      // FIXED: Consistent date formatting for submission activity
      const submissionActivity = {};
      
      allSubmissions.forEach(sub => {
        let timestamp = sub.submissionTimeSeconds;
        
        // Normalize timestamp to seconds
        if (timestamp instanceof Date) {
          timestamp = Math.floor(timestamp.getTime() / 1000);
        } else if (typeof timestamp === 'string') {
          const parsed = new Date(timestamp);
          if (!isNaN(parsed.getTime())) {
            timestamp = Math.floor(parsed.getTime() / 1000);
          } else {
            timestamp = parseInt(timestamp);
          }
        } else if (typeof timestamp === 'number') {
          // If it's in milliseconds, convert to seconds
          if (timestamp > 1000000000000) {
            timestamp = Math.floor(timestamp / 1000);
          }
        }
        
        // Skip invalid timestamps
        if (!timestamp || timestamp < 946684800) { // Before year 2000
          console.log('Skipping invalid timestamp:', sub.submissionTimeSeconds);
          return;
        }
        
        // CRITICAL FIX: Use UTC date formatting to match frontend
        const date = new Date(timestamp * 1000);
        if (isNaN(date.getTime())) {
          console.log('Invalid date created from timestamp:', timestamp);
          return;
        }
        
        // Format as YYYY-MM-DD in LOCAL timezone (not UTC)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        submissionActivity[dateStr] = (submissionActivity[dateStr] || 0) + 1;
      });

      // Enhanced debug logging
      console.log('=== SUBMISSION ACTIVITY DEBUG ===');
      console.log('Total submissions found:', allSubmissions.length);
      console.log('Submission activity object:', submissionActivity);
      console.log('Sample entries:', Object.entries(submissionActivity).slice(0, 10));
      console.log('Date range requested:', {
        daysAgo: daysAgo.toISOString(),
        days: parseInt(days)
      });

      // Filter out invalid dates and log final result
      const filteredActivity = Object.fromEntries(
        Object.entries(submissionActivity).filter(([date]) => {
          const isValid = date !== '1970-01-01' && date.match(/^\d{4}-\d{2}-\d{2}$/);
          if (!isValid) {
            console.log('Filtering out invalid date:', date);
          }
          return isValid;
        })
      );

      console.log('Final filtered activity:', filteredActivity);
      console.log('=== END DEBUG ===');

      res.json({
        totalSolved,
        averageRating,
        averagePerDay,
        hardestProblem: hardestProblem.rating ? hardestProblem : null,
        ratingDistribution,
        submissionActivity: filteredActivity,
        recentProblems: uniqueProblems.slice(0, 50) // Return recent 50 problems
      });

    } catch (error) {
      console.error('Error getting problem stats:', error);
      res.status(500).json({ error: 'Failed to get problem statistics' });
    }
  },

  // Add more problem-related endpoints as needed
};

module.exports = problemController;