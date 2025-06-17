const axios = require('axios');
const Student = require('../models/Student');
const Contest = require('../models/Contest');
const Submission = require('../models/Submission');

class CodeforcesService {
  constructor() {
    this.baseURL = 'https://codeforces.com/api';
    this.delay = 1000; // 1 second delay between requests
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchUserInfo(handle) {
    try {
      const response = await axios.get(`${this.baseURL}/user.info?handles=${handle}`);
      return response.data.result[0];
    } catch (error) {
      throw new Error(`Failed to fetch user info for ${handle}: ${error.message}`);
    }
  }

  async fetchUserSubmissions(handle, from = 1, count = 100000) {
    try {
      const response = await axios.get(
        `${this.baseURL}/user.status?handle=${handle}&from=${from}&count=${count}`
      );
      return response.data.result;
    } catch (error) {
      throw new Error(`Failed to fetch submissions for ${handle}: ${error.message}`);
    }
  }

  async fetchUserRating(handle) {
    try {
      const response = await axios.get(`${this.baseURL}/user.rating?handle=${handle}`);
      return response.data.result;
    } catch (error) {
      throw new Error(`Failed to fetch rating for ${handle}: ${error.message}`);
    }
  }

  async fetchContests() {
    try {
      const response = await axios.get(`${this.baseURL}/contest.list`);
      return response.data.result;
    } catch (error) {
      throw new Error(`Failed to fetch contests: ${error.message}`);
    }
  }

  async syncStudentData(student) {
    try {
      // Fetch user info
      const userInfo = await this.fetchUserInfo(student.cfHandle);
      await this.sleep(this.delay);

      // Update student basic info
      student.currentRating = userInfo.rating || 0;
      student.maxRating = userInfo.maxRating || 0;
      student.rank = userInfo.rank || 'unrated';
      student.lastDataSync = new Date();

      // Fetch submissions
      const submissions = await this.fetchUserSubmissions(student.cfHandle);
      await this.sleep(this.delay);

      // Process submissions
      const acceptedSubmissions = submissions.filter(sub => sub.verdict === 'OK');
      const uniqueProblems = new Set();
      let lastSubmissionTime = 0;

      for (const submission of submissions) {
        // Track last submission time
        if (submission.creationTimeSeconds > lastSubmissionTime) {
          lastSubmissionTime = submission.creationTimeSeconds;
        }

        // Save submission to database
        await Submission.findOneAndUpdate(
          { submissionId: submission.id },
          {
            submissionId: submission.id,
            contestId: submission.contestId,
            problemIndex: submission.problem.index,
            problemName: submission.problem.name,
            problemRating: submission.problem.rating,
            cfHandle: student.cfHandle,
            verdict: submission.verdict,
            programmingLanguage: submission.programmingLanguage,
            submissionTimeSeconds: submission.creationTimeSeconds
          },
          { upsert: true }
        );

        // Count unique solved problems
        if (submission.verdict === 'OK') {
          uniqueProblems.add(`${submission.contestId}-${submission.problem.index}`);
        }
      }

      // Fetch rating changes
      const ratingChanges = await this.fetchUserRating(student.cfHandle);
      await this.sleep(this.delay);

      // Update submissions with rating changes
      for (const change of ratingChanges) {
        await Submission.updateMany(
          { 
            cfHandle: student.cfHandle,
            contestId: change.contestId
          },
          {
            ratingChange: change.newRating - change.oldRating,
            rank: change.rank
          }
        );
      }

      // Update student stats
      student.totalSolved = uniqueProblems.size;
      student.lastSubmissionTime = lastSubmissionTime > 0 ? new Date(lastSubmissionTime * 1000) : null;

      await student.save();
      return student;

    } catch (error) {
      console.error(`Error syncing data for ${student.cfHandle}:`, error.message);
      throw error;
    }
  }

  async syncAllStudents() {
    const students = await Student.find({});
    console.log(`Starting sync for ${students.length} students`);

    for (const student of students) {
      try {
        await this.syncStudentData(student);
        console.log(`✓ Synced data for ${student.cfHandle}`);
      } catch (error) {
        console.error(`✗ Failed to sync ${student.cfHandle}:`, error.message);
      }
      await this.sleep(this.delay);
    }

    console.log('Sync completed for all students');
  }

  async syncContests() {
    try {
      const contests = await this.fetchContests();
      
      for (const contest of contests) {
        await Contest.findOneAndUpdate(
          { contestId: contest.id },
          {
            contestId: contest.id,
            name: contest.name,
            type: contest.type,
            phase: contest.phase,
            startTimeSeconds: contest.startTimeSeconds,
            durationSeconds: contest.durationSeconds
          },
          { upsert: true }
        );
      }

      console.log(`✓ Synced ${contests.length} contests`);
    } catch (error) {
      console.error('Failed to sync contests:', error.message);
    }
  }
}

module.exports = new CodeforcesService();