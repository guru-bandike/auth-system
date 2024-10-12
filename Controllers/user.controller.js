import jwt from 'jsonwebtoken';
import RequestError from '../errors/RequestError.js';
import UserRepository from '../Repositories/user.repository.js';
import EmailManager from '../Utils/emailManager.js';

export default class UserController {
  constructor() {
    this.userRepo = new UserRepository();
  }

  // Method to Register new
  async signup(req, res, next) {
    const details = req.body;
    try {
      await this.userRepo.signup(details);

      // Send success response to the user
      res.status(201).json({ success: true, message: 'User has been successfully Signed Up!' });
    } catch (err) {
      next(err);
    }
  }

  // Method to login user and send a JWT token
  async signin(req, res, next) {
    const { email, password } = req.body;

    // If the email or password are not provided , throw custom error to send failure response
    if (!email || email.trim().length == 0 || !password || password.trim().length == 0) {
      return next(
        new RequestError('Email address and password must be provided!', 400, {
          requestData: { email, password },
        })
      );
    }

    try {
      // Login user and get user details
      const user = await this.userRepo.signin(email, password);

      // Delete tokens that have expired by default (Not by the server)
      await this.userRepo.deleteExpiredTokens(user);

      const JWT_SECRET = process.env.JWT_SECRET;
      const payload = { userId: user._id };

      // Generate JWT token
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

      // Extract device info
      const deviceInfo = req.useragent;

      // Add token and device info to user's tokens array
      // This helps while logging out user from all devices
      await this.userRepo.addToken(user, token, deviceInfo);

      res.status(200).json({ success: true, message: 'User logged in successfully!', token });
    } catch (err) {
      next(err);
    }
  }

  // Method to signout user
  async signout(req, res, next) {
    const userId = req.userId;
    const token = req.headers['authorization'];

    try {
      // Mark the specified token as expired and update the user document
      const expiredToken = await this.userRepo.expireToken(userId, token);

      // Send success response to the user
      res
        .status(201)
        .json({ success: true, message: 'User has been successfully Logged out!', expiredToken });
    } catch (err) {
      next(err);
    }
  }

  // Method to signout on All devices
  async signoutAll(req, res, next) {
    const userId = req.userId;
    try {
      // Mark the all user tokens as expired and update the user document
      const expiredTokens = await this.userRepo.expireAllUserTokens(userId);

      // Send success response to the user
      res.status(201).json({
        success: true,
        message: 'User has been successfully Logged out from all devices!',
        expiredTokens,
      });
    } catch (err) {
      next(err);
    }
  }

  // Method get all user active sessions
  async getActiveSessions(req, res, next) {
    const userId = req.userId;
    try {
      // Get all user active sessions
      const activeSessions = await this.userRepo.getActiveSessions(userId);

      // Send success response to the user
      res.status(201).json({
        success: true,
        message: 'All user active sessions found!',
        activeSessions,
      });
    } catch (err) {
      next(err);
    }
  }

  // Method to reset user password
  async resetPassword(req, res, next) {
    try {
      const { userId } = req;
      const { oldPassword, newPassword } = req.body;

      // Ensure password is strong
      this.#ensurePasswordIsStrong(newPassword);

      // Reset password
      await this.userRepo.resetPassword(userId, oldPassword, newPassword);

      // Send success response
      res
        .status(200)
        .json({ success: true, message: `Password reset has been successfully completed!` });
    } catch (err) {
      next(err);
    }
  }

  // Method to reset user password
  async sendResetPassLink(req, res, next) {
    try {
      const { email } = req.body;

      // If the email not provided , throw Request error to send failure response
      if (!email || email.trim().length == 0)
        return next(new RequestError('Email must be provided!', 400));

      // Get User
      const user = await this.userRepo.getByEmail(email);

      // If user not found, throw Request error to send failure response
      if (!user) return next(new RequestError('User not found!', 400));

      // Send Reset link to user
      const addResetPassToken = await EmailManager.sendResetPassLink(req, email);

      // Add reset token to user doc
      await this.userRepo.addResetPassToken(email, addResetPassToken);

      // Send success response
      res.status(200).json({
        success: true,
        message: `Password reset link has been successfully sent to email!`,
      });
    } catch (err) {
      next(err);
    }
  }

  // Method to reset user password with reset password token
  async resetPasswordWithToken(req, res, next) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      // Ensure password is strong
      this.#ensurePasswordIsStrong(password);

      // Reset password
      await this.userRepo.resetPasswordWithToken(token, password);

      // Send success response
      res.status(200).json({
        success: true,
        message: `Password reset successful!`,
      });
    } catch (err) {
      next(err);
    }
  }

  // -------------------------------- Private Method Section: Start -------------------------------- //

  // Helper method to ensure password is strong
  #ensurePasswordIsStrong(password) {
    const strongPasswordRules = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,}$/;

    // If the password not provided , throw Request error to send failure response
    if (!password || password.trim().length == 0)
      throw new RequestError('Password must be provided!', 400);

    // If password is not strong, throw Request error to send failure response
    if (!strongPasswordRules.test(password))
      throw new RequestError(
        'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character!',
        400,
        { password }
      );
  }

  // -------------------------------- Private Method Section: End -------------------------------- //
}
