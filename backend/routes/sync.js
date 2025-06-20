const express = require('express');
const router = express.Router();
const cronService = require('../services/cronService');
const codeforcesService = require('../services/codeforcesService');
const problemUpdateService = require('../services/problemUpdateService');
const mongoose = require('mongoose');

// Get cron job status
// router.get('/status', (req, res) => {
//   res.json({
//     syncStatus: cronService.getJobStatus(),
//     problemUpdateStatus: problemUpdateService.getStatus()
//   });
// });

// Add to your syncRoutes.js or create a new health route
// router.get('/health', (req, res) => {
//   const now = new Date();
//   res.json({
//     status: 'OK',
//     serverTime: now.toISOString(),
//     uptime: process.uptime(),
//     cronStatus: cronService.getJobStatus(),
//     problemUpdateStatus: problemUpdateService.getStatus(),
//     dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
//   });
// });

// Add to your syncRoutes.js
router.post('/force-sync', async (req, res) => {
  try {
    console.log('🔧 Starting forced sync...');
    const startTime = Date.now();
    
    const results = await Promise.allSettled([
      codeforcesService.syncContests(),
      codeforcesService.syncAllStudents(),
      problemUpdateService.updateProblems()
    ]);
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    // Analyze results
    const successes = results.filter(r => r.status === 'fulfilled');
    const failures = results.filter(r => r.status === 'rejected');
    
    console.log(`🔄 Sync completed in ${duration}s (${successes.length} succeeded, ${failures.length} failed)`);
    
    if (failures.length > 0) {
      failures.forEach(f => console.error('Sync error:', f.reason));
    }
    
    res.json({
      status: failures.length === 0 ? 'complete' : 'partial',
      duration: `${duration}s`,
      successes: successes.length,
      failures: failures.length,
      errorDetails: failures.map(f => f.reason.message)
    });
  } catch (error) {
    console.error('Force sync failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update sync schedule
router.post('/schedule', (req, res) => {
  try {
    const { syncTime, inactivityCheckTime, problemUpdateTime } = req.body;
    
    if (syncTime) {
      cronService.updateSyncTime(syncTime);
    }
    
    if (inactivityCheckTime) {
      cronService.updateInactivityCheckTime(inactivityCheckTime);
    }

    if (problemUpdateTime) {
      problemUpdateService.startUpdateJob(problemUpdateTime);
    }
    
    res.json({ 
      message: 'Schedule updated successfully',
      status: {
        syncStatus: cronService.getJobStatus(),
        problemUpdateStatus: problemUpdateService.getStatus()
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Manual sync trigger
router.post('/trigger', async (req, res) => {
  try {
    // Run sync in background
    setImmediate(async () => {
      try {
        await codeforcesService.syncContests();
        await codeforcesService.syncAllStudents();
        await problemUpdateService.updateProblems();
        console.log('Manual sync completed');
      } catch (error) {
        console.error('Manual sync failed:', error.message);
      }
    });
    
    res.json({ message: 'Sync started in background' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;