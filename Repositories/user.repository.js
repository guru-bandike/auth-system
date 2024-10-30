import UserModel from '../Models/user.model.js';
import RequestError from '../errors/RequestError.js';

export default class UserRepository {
  // Method to register new user
  async signup(details) {
    try {
      await new UserModel(details).save();
    } catch (err) {
      throw err;
    }
  }

  // Method to Login user
  async resetPassword(userId, oldPassword, newPassword) {
    try {
      // Find user with email
      const user = await UserModel.findById(userId);

      // If user not found, throw Request error to send failure response
      if (!user) throw new RequestError('User not found!', 400);

      // If user signedUp with Google for and still not added/set passwrod, handle it
      if (!user.password)
        throw new RequestError(
          'User Signed Up with Google, So to add new password, request for forgot password!',
          400
        );
      // If old password is Not valid, throw Request error to send failure response
      if (!(await user.isValidPassword(oldPassword)))
        throw new RequestError('Invalid Old Password!', 400, { oldPassword });

      // Update password
      user.password = newPassword;
      await user.save();
    } catch (err) {
      throw err;
    }
  }

  // -------------------------------- Helper Method Section: Start -------------------------------- //

  // Method to get user with ID
  async getById(userId) {
    try {
      return await UserModel.findById(userId);
    } catch (err) {
      throw err;
    }
  }

  // Method to get user with email
  async getByEmail(email) {
    try {
      return await UserModel.findOne({ email });
    } catch (err) {
      throw err;
    }
  }

  // Method to add reset password token
  async addResetPassToken(email, addResetPassToken) {
    try {
      const user = await UserModel.findOne({ email });

      user.resetPassToken = addResetPassToken;
      user.resetPassTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // Set expiry time 10 minutes

      await user.save();
    } catch (err) {
      throw err;
    }
  }

  // Method to reset user password with reset password token
  async resetPasswordWithToken(token, password) {
    try {
      // Find the user with the reset token and make sure the token is not expired
      const user = await UserModel.findOne({
        resetPassToken: token,
        resetPassTokenExpiry: { $gt: Date.now() }, // Ensure token has not expired
      });

      if (!user)
        throw new RequestError(
          'Invalid or expired reset password link. Please request again to send a reset link!',
          400
        );

      // Update user password
      user.password = password;
      user.resetPassToken = undefined;
      user.resetPassTokenExpiry = undefined;
      await user.save();
    } catch (err) {
      throw err;
    }
  }

  // Method to verify the validity of the reset password link
  async isResetLinkValid(token) {
    try {
      // Ensure token is provided
      if (!token) return false;
      const user = await UserModel.findOne({
        resetPassToken: token,
        resetPassTokenExpiry: { $gt: Date.now() },
      });
      return Boolean(user);
    } catch (err) {
      throw err;
    }
  }

  // -------------------------------- Helper Method Section: End -------------------------------- //
}
