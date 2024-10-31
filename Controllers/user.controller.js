import { loginFailureReasons } from '../config/passport.config.js';
import UserRepository from '../Repositories/user.repository.js';
import { sendResetPasswordMail } from '../Utils/EmailService.js';
import passport from 'passport';

export default class UserController {
  constructor() {
    this.userRepo = new UserRepository();
  }

  // Method to Get SignUp view
  async getSignup(req, res, next) {
    try {
      res.render('signup', {
        title: 'Sign Up',
        cssFilePath: '/css/form.common.css',
        jsFilePath: '/js/form.common.js',
        errorMessages: req.flash('errorMessages'),
        successMessages: req.flash('successMessages'),
      });
    } catch (err) {
      next(err);
    }
  }

  // Method to Register new
  async signup(req, res, next) {
    const details = req.body;
    try {
      await this.userRepo.signup(details);

      req.flash('successMessages', ['Sing Up Successful!']);
      res.redirect('/user/login');
    } catch (err) {
      next(err);
    }
  }

  // Method to Login view
  async getLogin(req, res, next) {
    try {
      res.render('login', {
        title: 'Log In',
        cssFilePath: '/css/form.common.css',
        jsFilePath: '/js/form.common.js',
        errorMessages: req.flash('errorMessages'),
        successMessages: req.flash('successMessages'),
      });
    } catch (err) {
      next(err);
    }
  }

  // Method to login user
  async login(req, res, next) {
    try {
      passport.authenticate('local', (err, user, info, status) => {
        // Ensure there is no error with passport authenticate
        if (err) return next(err);

        if (!user) {
          const { INVALID_EMAIL, SIGNED_UP_WITH_GOOGLE } = loginFailureReasons;

          // Ensure provided email is valid
          if (info.failureReason === INVALID_EMAIL) {
            req.flash('errorMessages', [
              'We dont have any account associated with this email, Please SignUp to continue!',
            ]);
            return res.redirect('/user/signup');

            // Ensure user already Have password
          } else if (info.failureReason === SIGNED_UP_WITH_GOOGLE) {
            req.flash('errorMessages', [
              'User Signed Up with Google, So either login with Google or Request for forgot password to add password!',
            ]);
            return res.redirect('/user/forgot-password');

            // Ensure provided passowrd is valid
          } else {
            req.flash('errorMessages', ['Invalid Password!']);
            return res.redirect(req.originalUrl);
          }
        }

        // Login user
        req.login(user, (err) => {
          // Ensure there is not error while login
          if (err) return next(err);

          // Redirect user to home
          res.redirect('/');
        });
      })(req, res, next);
    } catch (err) {
      next(err);
    }
  }

  // Method to Logout user
  async logout(req, res, next) {
    req.logout((err) => {
      if (err) return next(err);

      req.flash('successMessages', ['Log Out Successful!']);
      res.redirect('/user/login');
    });
  }

  // Method get all user logged in devices
  async getLoggedInDevices(req, res, next) {
    const userId = req.user._id.toString();

    try {
      req.sessionStore.all((err, sessions) => {
        if (err) return next(err);

        const loggedInDevices = sessions
          .filter((s) => s.deviceDetails?.userId === userId)
          .map((s) => s.deviceDetails);

        res.render('logged-in-devices', {
          title: 'Logged In Devices',
          loggedInDevices,
          cssFilePath: '/css/loggedInDevices.css',
          errorMessages: req.flash('errorMessages'),
          successMessages: req.flash('successMessages'),
        });
      });
    } catch (err) {
      next(err);
    }
  }

  // Method to Get Reset password after logIn view
  async getResetPassAfterLogin(req, res, next) {
    try {
      res.render('reset-password-after-login', {
        title: 'Reset Password',
        cssFilePath: '/css/form.common.css',
        jsFilePath: '/js/form.common.js',
        errorMessages: req.flash('errorMessages'),
        successMessages: req.flash('successMessages'),
      });
    } catch (err) {
      next(err);
    }
  }

  // Method to reset user password
  async resetPassAfterLogin(req, res, next) {
    try {
      const userId = req.user._id.toString();
      const { oldPassword, newPassword } = req.body;

      // Ensure password are provided
      if (!oldPassword || !newPassword) {
        req.flash('errorMessages', ['Old and New passowrds must be Prodived!']);
        return res.redirect(req.originalUrl);
      }

      // Ensure new password is strong
      if (!this.#isPasswordStrong(newPassword)) {
        req.flash('errorMessages', [
          'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character!',
        ]);
        return res.redirect(req.originalUrl);
      }

      // Reset password
      await this.userRepo.resetPassword(userId, oldPassword, newPassword);

      req.flash('successMessages', ['Password Reset Successful!']);
      res.redirect(req.originalUrl);
    } catch (err) {
      next(err);
    }
  }

  // Method to Get Forgot password request view
  async getForgotPass(req, res, next) {
    try {
      res.render('forgot-password-req', {
        title: 'Forgot Password',
        cssFilePath: '/css/form.common.css',
        jsFilePath: '/js/form.common.js',
        errorMessages: req.flash('errorMessages'),
        successMessages: req.flash('successMessages'),
      });
    } catch (err) {
      next(err);
    }
  }

  // Method to send reset password link to user email
  async sendResetPassLink(req, res, next) {
    try {
      const { email } = req.body;

      if (!email || email.trim().length === 0) {
        req.flash('errorMessages', ['Email must be provided!']);
        return res.redirect(req.originalUrl);
      }

      const user = await this.userRepo.getByEmail(email);
      if (!user) {
        req.flash('errorMessages', ['User Not Found!']);
        return res.redirect(req.originalUrl);
      }

      const resetToken = await sendResetPasswordMail(req, email);

      user.resetPassToken = resetToken;
      user.resetPassTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();

      req.flash('successMessages', ['Password Reset Link will be sent to your email shortly!']);
      return res.redirect(req.originalUrl);
    } catch (error) {
      next(error);
    }
  }

  // Method to Get reset password after forgot request view
  async getResetPassAfterForgotReq(req, res, next) {
    const { token } = req.params;
    // Ensure req is valid
    if (!(await this.userRepo.isResetLinkValid(token))) {
      req.flash('errorMessages', ['Invalid Reset Password Link!']);
      return res.redirect('/user/login');
    }

    try {
      res.render('reset-password-after-forgot-req', {
        title: 'Reset Password',
        cssFilePath: '/css/form.common.css',
        jsFilePath: '/js/form.common.js',
        errorMessages: req.flash('errorMessages'),
        successMessages: req.flash('successMessages'),
        token,
      });
    } catch (err) {
      next(err);
    }
  }

  // Method to reset user password after forgot request
  async resetPasswordAfterForgotReq(req, res, next) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      // Ensure password are provided
      if (!password) {
        req.flash('errorMessages', ['Passowrd must be Prodived!']);
        return res.redirect(req.originalUrl);
      }

      // Ensure new password is strong
      if (!this.#isPasswordStrong(password)) {
        req.flash('errorMessages', [
          'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character!',
        ]);
        return res.redirect(req.originalUrl);
      }

      // Reset password
      await this.userRepo.resetPasswordWithToken(token, password);

      // Attach error to the request to access in further process
      req.flash('successMessages', ['Password Reset Successful!']);
      res.redirect('/user/login');
    } catch (err) {
      next(err);
    }
  }

  googleAuth(req, res, next) {
    passport.authenticate('google', { failureRedirect: '/user/login' })(req, res, () => {
      res.redirect('/'); // Redirect to home on successful login
    });
  }

  // -------------------------------- Private Method Section: Start -------------------------------- //

  // Helper method to ensure password is strong
  #isPasswordStrong(password) {
    const strongPasswordRules = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,}$/;

    return strongPasswordRules.test(password);
  }
  // -------------------------------- Private Method Section: End -------------------------------- //
}
