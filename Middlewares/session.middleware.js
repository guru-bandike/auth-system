import MongoStore from 'connect-mongo';
import session from 'express-session';

const DB_NAME = process.env.DB_NAME || 'auth-system';
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const SESSION_SECRET = process.env.SESSION_SECRET || 'temp_session_secret';

const sessionMiddleware = session({
  secret: SESSION_SECRET,
  resave: true, // Save session even if unmodified
  cookie: {
    maxAge: 1000 * 60 * 60, // 1 hour
    sameSite: 'lax', // cross-site request forgery (CSRF) protection
    httpOnly: true, // Prevents client-side JavaScript from accessing cookies, reducing the risk of cross-site scripting (XSS) attacks.
  },
  saveUninitialized: false, // Don't create session until something stored
  store: MongoStore.create({ mongoUrl: MONGODB_URL, dbName: DB_NAME }), // Store sessions in DB
});

export default sessionMiddleware;
