import express from 'express';
import UserController from '../Controllers/user.controller.js';
import authUser from '../Middlewares/auth-user.middleware.js';
import validateUserDetails from '../Middlewares/validateUserDetails.validation.middleware.js';

// Initialize User Router
const userRouter = express.Router();

// Initialize User Controller
const userController = new UserController();

// Route to register a new user.
userRouter.post('/signup', validateUserDetails, (req, res, next) => {
  userController.signup(req, res, next);
});

// Route to Login user
userRouter.post('/signin', (req, res, next) => {
  userController.signin(req, res, next);
});

// Route to signout user
userRouter.post('/signout', authUser, (req, res, next) => {
  userController.signout(req, res, next);
});

// Route to  from all user devices
userRouter.post('/signout-all-devices', authUser, (req, res, next) => {
  userController.All(req, res, next);
});

// Route to get user active sessions
userRouter.get('/active-sessions', authUser, (req, res, next) => {
  userController.getActiveSessions(req, res, next);
});

// Route to Reset user password after logIn
userRouter.post('/reset-password', authUser, (req, res, next) => {
  userController.resetPassword(req, res, next);
});

// Route to reset password with forgot password token
userRouter.post('/reset-password/:token', (req, res, next) => {
  userController.resetPasswordWithToken(req, res, next);
});

// Route to get link to reset when Forgot password
userRouter.post('/forgot-password', (req, res, next) => {
  userController.sendResetPassLink(req, res, next);
});

export default userRouter;
