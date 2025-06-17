const nodemailer = require('nodemailer');
const EmailLog = require('../models/EmailLog');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendInactivityReminder(student) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: student.email,
        subject: 'Get Back to Problem Solving! 🚀',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; text-align: center;">Hey ${student.name}! 👋</h2>
            <p style="color: #666; line-height: 1.6;">
              We noticed you haven't made any submissions on Codeforces in the last 7 days. 
              Consistent practice is key to improving your problem-solving skills!
            </p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Your Current Stats:</h3>
              <ul style="color: #666;">
                <li>Current Rating: <strong>${student.currentRating}</strong></li>
                <li>Max Rating: <strong>${student.maxRating}</strong></li>
                <li>Problems Solved: <strong>${student.totalSolved}</strong></li>
              </ul>
            </div>
            <p style="color: #666; line-height: 1.6;">
              Ready to get back on track? Start with some easy problems and build your momentum!
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://codeforces.com/problemset" 
                 style="background: #007bff; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; display: inline-block;">
                Start Solving Problems
              </a>
            </div>
            <p style="color: #999; font-size: 12px; text-align: center;">
              You can disable these reminders from your profile settings.
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);

      // Log the email
      await EmailLog.create({
        studentId: student._id,
        cfHandle: student.cfHandle,
        emailType: 'inactivity_reminder',
        success: true
      });

      console.log(`✓ Sent inactivity reminder to ${student.email}`);
      return true;

    } catch (error) {
      console.error(`✗ Failed to send email to ${student.email}:`, error.message);
      
      // Log the failed attempt
      await EmailLog.create({
        studentId: student._id,
        cfHandle: student.cfHandle,
        emailType: 'inactivity_reminder',
        success: false
      });

      return false;
    }
  }
}

module.exports = new EmailService();