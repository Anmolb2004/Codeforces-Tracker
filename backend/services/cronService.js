const cron = require('node-cron');
const codeforcesService = require('./codeforcesService');
const emailService = require('./emailService');
const Student = require('../models/Student');

class CronService {
  constructor() {
    this.syncJob = null;
    this.inactivityJob = null;
    this.syncTime = '0 2 * * *'; // Default: 2 AM daily
    this.inactivityCheckTime = '0 3 * * *'; // Default: 3 AM daily
  }

  startSyncJob(cronTime = this.syncTime) {
    if (this.syncJob) {
      this.syncJob.stop();
    }

    this.syncJob = cron.schedule(cronTime, async () => {
      console.log('🔄 Starting scheduled data sync...');
      try {
        await codeforcesService.syncContests();
        await codeforcesService.syncAllStudents();
        console.log('✅ Scheduled sync completed successfully');
      } catch (error) {
        console.error('❌ Scheduled sync failed:', error.message);
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Kolkata'
    });

    console.log(`📅 Sync job scheduled for: ${cronTime}`);
    this.syncTime = cronTime;
  }

  startInactivityCheck(cronTime = this.inactivityCheckTime) {
    if (this.inactivityJob) {
      this.inactivityJob.stop();
    }

    this.inactivityJob = cron.schedule(cronTime, async () => {
      console.log('📧 Checking for inactive students...');
      try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
        const inactiveStudents = await Student.find({
          emailRemindersEnabled: true,
          $or: [
            { lastSubmissionTime: { $lt: sevenDaysAgo } },
            { lastSubmissionTime: null }
          ]
        });

        console.log(`Found ${inactiveStudents.length} inactive students`);

        for (const student of inactiveStudents) {
          await emailService.sendInactivityReminder(student);
          // Add delay to avoid hitting email rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('✅ Inactivity check completed');
      } catch (error) {
        console.error('❌ Inactivity check failed:', error.message);
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Kolkata'
    });

    console.log(`📧 Inactivity check scheduled for: ${cronTime}`);
    this.inactivityCheckTime = cronTime;
  }

  updateSyncTime(cronTime) {
    this.startSyncJob(cronTime);
  }

  updateInactivityCheckTime(cronTime) {
    this.startInactivityCheck(cronTime);
  }

  stopAllJobs() {
    if (this.syncJob) {
      this.syncJob.stop();
      console.log('🛑 Sync job stopped');
    }
    if (this.inactivityJob) {
      this.inactivityJob.stop();
      console.log('🛑 Inactivity check job stopped');
    }
  }

  getJobStatus() {
    return {
      syncJob: {
        running: this.syncJob ? this.syncJob.running : false,
        schedule: this.syncTime
      },
      inactivityJob: {
        running: this.inactivityJob ? this.inactivityJob.running : false,
        schedule: this.inactivityCheckTime
      }
    };
  }
}

module.exports = new CronService();