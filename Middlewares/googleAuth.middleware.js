import passport from 'passport';

// Middleware to initiate Google OAuth login process
const initiateGoogleLogin = passport.authenticate('google', { scope: ['profile', 'email'] });

// Middleware to handle Google OAuth callback and verify user authentication
const handleGoogleLoginCallback = passport.authenticate('google', {
  failureRedirect: '/user/login', // Redirect to login if authentication fails
});

export { initiateGoogleLogin, handleGoogleLoginCallback };
