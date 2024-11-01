import axios from 'axios';

// Method to ensure reCAPTCHA successful
const validateRecaptcha = async (req, res, next) => {
  const recaptchaResponse = req.body['g-recaptcha-response'];

  // Ensure response is provided
  if (!recaptchaResponse) {
    req.flash('errorMessages', ['Please Complete The reCAPTCHA!']);
    return res.redirect(req.originalUrl);
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaResponse}`;

  const response = await axios.post(verificationURL); // Verify with Google API

  // Ensure user successfully completed recaptcha
  if (!response.data.success) {
    req.flash('errorMessages', ['Please Complete The reCAPTCHA!']);
    return res.redirect(req.originalUrl);
  }

  // Proceed with next middleware
  next();
};

export default validateRecaptcha;
