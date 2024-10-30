// Middleware to Authenticate user
const auth = (req, res, next) => {
  // If User is Authenticated, Allow access to the route
  if (req.isAuthenticated()) return next();
  // Else, Redirect to Login page
  else res.redirect('/user/login');
};

export default auth;
