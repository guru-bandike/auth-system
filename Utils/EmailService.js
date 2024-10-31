import { Queue, Worker } from 'bullmq';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import logError from './errorLogger.js';

const redisConnection = {
  url: process.env.REDIS_URL, // Use cloud Redis URL
  maxRetriesPerRequest: null, // Required by BullMQ for Redis Cloud
};

// Initialize the queue
const emailQueue = new Queue('emailQueue', { connection: redisConnection });

// Worker to process jobs
const worker = new Worker(
  'emailQueue',
  async (job) => {
    // Destructure email data from job
    const { mailOptions } = job.data;

    // Set up Nodemailer transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_ADDRESS, pass: process.env.GMAIL_PAAKEY },
    });

    // Send email
    await transporter.sendMail(mailOptions);
  },
  { connection: redisConnection }
);

worker.on('failed', (job, err) => {
  logError(err);
  console.error(`Failed to send Reset password email, Checkout error.log for more info!`);
});

// Function to add email jobs to the queue
const sendResetPasswordMail = async (req, toEmail) => {
  const resetToken = crypto.randomBytes(20).toString('hex');
  const resetLink = `${req.protocol}://${req.get('host')}/user/reset-password/${resetToken}`;

  // Define email options
  const mailOptions = {
    from: process.env.GMAIL_ADDRESS,
    to: toEmail,
    subject: 'Password Reset Request',
    html: `
    <div style="background-color: #f4f4f4; padding: 20px; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);">
        <h2 style="text-align: center; color: #333;">Password Reset Request</h2>
        <p style="color: #666; font-size: 16px;">
          Hello,
        </p>
        <p style="color: #666; font-size: 16px;">
          You requested a password reset for your account. Please click the button below to reset your password.
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${resetLink}" style="background-color: #007bff; color: #ffffff; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 5px; font-size: 16px;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 16px;">
          Note: This link is only valid for the next 10 minutes.
        </p>
      </div>
    </div>
  `,
  };

  await emailQueue.add(
    'sendEmail',
    { mailOptions },
    { attempts: 3 } // Retry up to 3 times if sending fails
  );

  return resetToken;
};

export { sendResetPasswordMail };
