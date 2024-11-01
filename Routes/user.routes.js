import express from 'express';
import UserController from '../Controllers/user.controller.js';
import auth from '../Middlewares/auth.middleware.js';
import validateUserDetails from '../Middlewares/validateUserDetails.validation.middleware.js';
import {
  handleGoogleLoginCallback,
  initiateGoogleLogin,
} from '../Middlewares/googleAuth.middleware.js';
import ensureUserNotLoggedIn from '../Middlewares/ensureUserNotLoggedIn.middleware.js';
import validateRecaptcha from '../Middlewares/recaptchaValidator.middleware.js';

// Initialize User Router
const userRouter = express.Router();

// Initialize User Controller
const userController = new UserController();

// Route to Get SignUp view
userRouter.get('/signup', ensureUserNotLoggedIn, (req, res, next) => {
  userController.getSignup(req, res, next);
});

// Route to register a new user.
userRouter.post(
  '/signup',
  ensureUserNotLoggedIn,
  validateRecaptcha,
  validateUserDetails,
  (req, res, next) => {
    userController.signup(req, res, next);
  }
);

// Route to Get Login view
userRouter.get('/login', ensureUserNotLoggedIn, (req, res, next) => {
  userController.getLogin(req, res, next);
});

// Route to Login user
userRouter.post('/login', ensureUserNotLoggedIn, validateRecaptcha, (req, res, next) => {
  userController.login(req, res, next);
});

// Route to logout user
userRouter.get('/logout', auth, (req, res, next) => {
  userController.logout(req, res, next);
});

// Route to get user logged in devices
userRouter.get('/logged-in-devices', auth, (req, res, next) => {
  userController.getLoggedInDevices(req, res, next);
});

// Route to get Reset user password after logIn view
userRouter.get('/reset-password', auth, (req, res, next) => {
  userController.getResetPassAfterLogin(req, res, next);
});

// Route to Reset user password after logIn
userRouter.post('/reset-password', auth, (req, res, next) => {
  userController.resetPassAfterLogin(req, res, next);
});

// Route to get Forgot password view
userRouter.get('/forgot-password', ensureUserNotLoggedIn, (req, res, next) => {
  userController.getForgotPass(req, res, next);
});

// Route to get link to reset when Forgot password
userRouter.post('/forgot-password', ensureUserNotLoggedIn, (req, res, next) => {
  userController.sendResetPassLink(req, res, next);
});

// Route to get reset password after forgot request view
userRouter.get('/reset-password/:token', ensureUserNotLoggedIn, (req, res, next) => {
  userController.getResetPassAfterForgotReq(req, res, next);
});

// Route to reset password with forgot password token
userRouter.post('/reset-password/:token', ensureUserNotLoggedIn, (req, res, next) => {
  userController.resetPasswordAfterForgotReq(req, res, next);
});

// Route to take user to Google OAuth login page
userRouter.get('/auth/google', initiateGoogleLogin);

// Route to handle the callback from Google OAuth
userRouter.get('/auth/google/callback', handleGoogleLoginCallback, (req, res) => {
  res.redirect('/');
});

export default userRouter;
