// Middleware to welcome user
const welcomeUser = (req, res) => {
  res.status(200).json({ success: true, message: 'Welcome to Auth-System!' });
};

export default welcomeUser;
