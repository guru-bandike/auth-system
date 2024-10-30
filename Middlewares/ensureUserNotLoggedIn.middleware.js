// Middleware to Ensure user not logged in
const ensureUserNotLoggedIn = (req, res, next) => {
  // If User Not logged In, Allow access to the route
  if (!req.isAuthenticated()) return next();
  // Else, Redirect to home page
  else res.redirect('/');
};

export default ensureUserNotLoggedIn;
