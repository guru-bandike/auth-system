import mongoose from 'mongoose';
import bcryptHasher from 'bcrypt';
import RequestError from '../errors/RequestError.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required!'],
      minLength: [3, 'User name should atleast contain 3 characters!'],
    },
    email: {
      type: String,
      required: [true, 'User email is required!'],
      unique: true,
      validate: {
        validator: (email) => {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: 'Invalid email address!',
      },
    },
    password: { type: String },
    googleId: { type: String },
    resetPassToken: String,
    resetPassTokenExpiry: Date,
  },
  { timestamps: true }
);

// -------------------------------- Middleware Section: Start -------------------------------- //

// Middleware to hash the password before saving the user document
userSchema.pre('save', async function (next) {
  const userDoc = this;

  // If the user password is not modified, proceed saving without hashing password
  if (!userDoc.isModified('password')) return next();

  /**
   * Define salt rounds for bcrypt
   * Salt rounds add randomness to hashed passwords, enhancing security against brute-force attacks.
   * The higher the number of rounds, the more secure the hash, but it will also take more computational time.
   * Conversely, fewer rounds result in less security but faster computation.
   */
  const saltRounds = 10;

  try {
    // Hash password
    await bcryptHasher.hash(userDoc.password, saltRounds).then((hashedPassword) => {
      // Replace the user enterd password with hashed password
      userDoc.password = hashedPassword;
      next(); // proceed saving
    });
  } catch (err) {
    // If there are any errors during hashing,
    // Pass the error to the next() function so that Express's error-handling middleware can detect and handle it appropriately
    next(err);
  }
});

// -------------------------------- Middleware Section: End -------------------------------- //

// -------------------------------- User Document Methods section: Start -------------------------------- //

// Define an instance method to verify input passowrd
userSchema.methods.isValidPassword = async function (requestPassword) {
  // 'this' refers to the user document on which the method is called
  const userDoc = this;
  const hashedPassword = userDoc.password;

  // Throw a custom error if the password is not provided or empty
  if (!requestPassword || requestPassword.trim().length === 0)
    throw new RequestError('Password must be provided!', 400);

  // Return the comparision result of request password and hashed password
  return await bcryptHasher.compare(requestPassword, hashedPassword);
};

// -------------------------------- User Document Methods section: End -------------------------------- //

// -------------------------------- User Model Methods section: Start -------------------------------- //

// Define a static method in the User schema to check if an email is already in use
userSchema.statics.isEmailInUse = async function (email) {
  const userModel = this;

  // Throw a custom error if the email is not provided or empty
  if (!email || email.trim().length === 0) {
    throw new RequestError('Email address must be provided!', 400, { email });
  }

  // Find a user with the provided email in the database
  const user = await userModel.findOne({ email });

  // If a user is found with the email, return true (email is in use), otherwise return false
  return !!user;
};

// -------------------------------- User Model Methods section: End -------------------------------- //

const UserModel = mongoose.model('user', userSchema);
export default UserModel;
