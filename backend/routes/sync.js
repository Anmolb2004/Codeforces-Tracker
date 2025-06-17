const express = require('express');
const router = express.Router();
const cronService = require('../services/cronService');
const codeforcesService = require('../services/codeforcesService');

// Get cron job status
router.get('/status', (req, res) => {
  res.json(cronService.getJobStatus());
});

// Update sync schedule
router.post('/schedule', (req, res) => {
  try {
    const { syncTime, inactivityCheckTime } = req.body;
    
    if (syncTime) {
      cronService.updateSyncTime(syncTime);
    }
    
    if (inactivityCheckTime) {
      cronService.updateInactivityCheckTime(inactivityCheckTime);
    }
    
    res.json({ 
      message: 'Schedule updated successfully',
      status: cronService.getJobStatus()
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