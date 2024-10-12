import mailer from 'nodemailer';
import crypto from 'crypto';

// Create email transporter
const transporter = mailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_ADDRESS, pass: process.env.GMAIL_PAAKEY },
});

export default class EmailManager {
  static async sendResetPassLink(req, toEmail) {
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetLink = `${req.protocol}://${req.get('host')}/user/reset-password/${resetToken}`;

    // Define email options
    const mailOptions = {
      from: process.env.GMAIL_ADDRESS,
      to: toEmail,
      subject: 'Password Reset',
      text: `
        You requested a password reset. 
        Click the link to reset your password: ${resetLink}
        This link is only valid for the next 10 minutes!`,
    };

    // Send email to the user email
    await transporter.sendMail(mailOptions);

    return resetToken;
  }
}
