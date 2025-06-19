const cron = require('node-cron');
const axios = require('axios');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const { RateLimiter } = require('limiter');

class ProblemUpdateService {
  constructor() {
    this.updateJob = null;
    this.scheduleTime = '0 4 * * *'; // Default: 4 AM daily
    this.apiLimiter = new RateLimiter({
      tokensPerInterval: 1,
      interval: 2000 // 1 request per 2 seconds
    });
  }

  startUpdateJob(cronTime = this.scheduleTime) {
    if (this.updateJob) {
      this.updateJob.stop();
    }

    this.updateJob = cron.schedule(cronTime, this.updateProblems, {
      scheduled: true,
      timezone: 'Asia/Kolkata'
    });

    console.log(`📅 Problem update job scheduled for: ${cronTime}`);
    this.scheduleTime = cronTime;
  }

  isValidProblemId(contestId, problemIndex) {
    // Validate contestId is a positive integer
    if (!Number.isInteger(Number(contestId)) || Number(contestId) <= 0) {
      return false;
    }
    
    // Validate problemIndex format (typically A-Z, sometimes A1, A2, etc.)
    if (!problemIndex.match(/^[A-Za-z][0-9]*$/)) {
      return false;
    }
    
    return true;
  }

  updateProblems = async () => {
    try {
      console.log('🚀 Starting problem data update...');
      
      // Get all unique problems from submissions
      const uniqueProblems = await Submission.aggregate([
        { $match: { verdict: 'OK' } },
        { $group: { 
          _id: { contestId: '$contestId', index: '$problemIndex' },
          count: { $sum: 1 } 
        } },
        { $sort: { count: -1 } } // Process most submitted problems first
      ]);

      let successCount = 0;
      let skipCount = 0;
      let errorCount = 0;

      // Process in batches with delays
      for (let i = 0; i < uniqueProblems.length; i++) {
        const { _id } = uniqueProblems[i];
        
        // Skip invalid problem IDs
        if (!this.isValidProblemId(_id.contestId, _id.index)) {
          console.log(`⏭️ Skipping invalid problem ID: ${_id.contestId}${_id.index}`);
          skipCount++;
          continue;
        }

        try {
          // Apply rate limiting
          await this.apiLimiter.removeTokens(1);
          
          const response = await axios.get(
            `https://codeforces.com/api/problemset.problem?contestId=${_id.contestId}&problemIndex=${_id.index}`,
            { timeout: 10000 }
          );
          
          if (response.data.status === 'OK') {
            const problemData = response.data.result.problem;
            
            await Problem.findOneAndUpdate(
              { contestId: _id.contestId, index: _id.index },
              {
                name: problemData.name,
                type: problemData.type,
                rating: problemData.rating,
                tags: problemData.tags,
                lastUpdated: new Date()
              },
              { upsert: true, new: true }
            );
            
            successCount++;
            console.log(`✅ Updated ${_id.contestId}${_id.index}`);
          } else {
            console.log(`❌ Problem not found: ${_id.contestId}${_id.index}`);
            errorCount++;
          }
        } catch (error) {
          if (error.response) {
            if (error.response.status === 404) {
              console.log(`🔍 Problem not found (404): ${_id.contestId}${_id.index}`);
            } else if (error.response.status === 429) {
              console.log('⚠️ Rate limit exceeded, waiting 10 seconds...');
              await new Promise(resolve => setTimeout(resolve, 10000));
              i--; // Retry the same problem
              continue;
            } else {
              console.error(`⚠️ API error for ${_id.contestId}${_id.index}:`, error.response.status);
            }
          } else {
            console.error(`⚠️ Error updating ${_id.contestId}${_id.index}:`, error.message);
          }
          errorCount++;
        }

        // Add small delay between requests even when successful
        if (i < uniqueProblems.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      console.log(`🎉 Update completed: 
        ${successCount} successful, 
        ${errorCount} errors, 
        ${skipCount} skipped`);
      
      return {
        successCount,
        errorCount,
        skipCount,
        totalProcessed: uniqueProblems.length
      };
    } catch (error) {
      console.error('💥 Critical error in problem update job:', error);
      throw error;
    }
  }

  async cleanupInvalidProblems() {
    try {
      console.log('🧹 Starting cleanup of invalid problems...');
      const problems = await Problem.find({});
      let deletedCount = 0;
      
      for (const problem of problems) {
        if (!this.isValidProblemId(problem.contestId, problem.index)) {
          console.log(`🗑️ Deleting invalid problem: ${problem.contestId}${problem.index}`);
          await Problem.deleteOne({ _id: problem._id });
          deletedCount++;
        }
      }
      
      console.log(`🧹 Cleanup completed: ${deletedCount} problems removed`);
      return deletedCount;
    } catch (error) {
      console.error('💥 Error during cleanup:', error);
      throw error;
    }
  }

  stopJob() {
    if (this.updateJob) {
      this.updateJob.stop();
      console.log('🛑 Problem update job stopped');
    }
  }

  getStatus() {
    return {
      running: this.updateJob ? this.updateJob.running : false,
      schedule: this.scheduleTime,
      lastRun: this.lastRun,
      nextRun: this.updateJob ? this.updateJob.nextDate() : null
    };
  }
}

module.exports = new ProblemUpdateService();