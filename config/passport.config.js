import passport from 'passport';
import LocalStrategy from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import UserModel from '../Models/user.model.js';

export const loginFailureReasons = {
  INVALID_EMAIL: 'Invalid Email',
  INVALID_PASSWORD: 'Invalid Password',
  SIGNED_UP_WITH_GOOGLE: 'Signed Up With Google',
};

// Configure Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
    },
    async (email, password, done) => {
      try {
        const user = await UserModel.findOne({ email });

        // Ensure email is valid or user existence
        if (!user) return done(null, false, { failureReason: loginFailureReasons.INVALID_EMAIL });

        // Ensure user Have password
        if (user.googleId && !user.password)
          return done(null, false, { failureReason: loginFailureReasons.SIGNED_UP_WITH_GOOGLE });

        // Ensure password is valid
        if (!(await user.isValidPassword(password)))
          return done(null, false, { failureReason: loginFailureReasons.INVALID_PASSWORD });

        // Validate user
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/user/auth/google/callback',
    },
    async (token, tokenSecret, profile, done) => {
      const email = profile.emails[0].value;

      try {
        let user = await UserModel.findOne({ email });
        if (!user) {
          user = new UserModel({
            googleId: profile.id,
            name: profile.displayName,
            email,
          });
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Serialize user
passport.serializeUser((req, user, done) => {
  const { platform: device, os, browser } = req.useragent;

  req.session.deviceDetails = { userId: user._id, device, os, browser };

  done(null, user._id); // store user ID in session
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id); // Find user by ID in the database
    done(null, user); // Attach user object to request
  } catch (err) {
    done(err, null);
  }
});
