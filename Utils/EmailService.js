import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { emailQueue, connection } from '../config/queue.config.js';
import { Worker } from 'bullmq';
import logError from './errorLogger.js';

class EmailService {
  constructor() {
    // Configure transporter
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_ADDRESS,
        pass: process.env.GMAIL_PAAKEY,
      },
    });

    // Initialize email worker
    this.emailWorker = new Worker(
      'emailQueue',
      async (job) => {
        try {
          const { mailOptions } = job.data;
          await this.transporter.sendMail(mailOptions);
        } catch (error) {
          throw error; // Ensures job is marked as failed
        }
      },
      { connection }
    );

    // Add event listeners for logging
    this.emailWorker.on('failed', (job, err) => {
      logError(err); // log error in separate file
      console.error(`Failed to send Reset password email, checkout error.log for more info!`);
    });
  }

  // Method to create and queue the reset password email
  async sendResetPassLink(req, toEmail) {
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetLink = `${req.protocol}://${req.get('host')}/user/reset-password/${resetToken}`;

    // Define email options
    const mailOptions = {
      from: process.env.GMAIL_ADDRESS,
      to: toEmail,
      subject: 'Password Reset',
      text: `You requested a password reset.Click the link to reset your password: ${resetLink}\nThis link is only valid for the next 10 minutes!`,
    };

    // Queue the email job
    await emailQueue.add('sendEmail', { mailOptions });

    return resetToken;
  }
}

// Export an instance of EmailService
export default new EmailService();
