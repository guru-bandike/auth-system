import mongoose from 'mongoose';
import RequestError from '../errors/RequestError.js';
import logError from '../Utils/errorLogger.js';

const handleGlobalErrors = (err, req, res, next) => {
  // Handle RequestError
  if (err instanceof RequestError) {
    // Attach error to the request to access in further process
    if (err.dataObj?.validationErrors) {
      req.flash('errorMessages', err.dataObj.validationErrors);
    } else {
      req.flash('errorMessages', [err.message]);
    }

    return res.redirect(req.originalUrl); // Redirect to the same url
  }

  // Handle Mongoose ValidationError
  if (err instanceof mongoose.Error.ValidationError) {
    // Extract the field names that caused validation errors
    const errorMessages = Object.keys(err.errors).map((key) => err.errors[key].message);

    // Attach error to the request to access in further process
    req.flash('errorMessages', errorMessages);
    return res.redirect(req.originalUrl);
  }

  // Handle MongoDB Duplicate Key Error
  if (err.name === 'MongoServerError' && err.code == 11000) {
    const field = Object.keys(err.keyPattern)[0];

    // Attach error to the request to access in further process
    req.flash('errorMessages', [`${field} must be unique!`]);
    return res.redirect(req.originalUrl);
  }

  // Handle InternalOAuthError (Google OAuth Failure)
  if (err.name === 'InternalOAuthError') {
    console.error('OAuth2 Error:', err); // Log the actual error for debugging

    // You can pass a custom message to display on failure
    req.flash('errorMessages', ['Failed to login, Please try again!']);
    return res.redirect('/user/login'); // Redirect to the login page or wherever you handle OAuth failures
  }

  // Log the error for debugging purposes
  logError(err);

  // Otherwise, it's an unknown error, so send a response
  res.render('500', {
    title: 'Something Went Wrong',
    cssFilePath: '/css/form.common.css',
    errorMessages: req.flash('errorMessages'),
    successMessages: req.flash('successMessages'),
  });
};

export default handleGlobalErrors;
