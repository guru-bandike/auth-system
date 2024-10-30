// Import necessary External modules
import cors from 'cors';
import express from 'express';
import flash from 'connect-flash';
import userAgent from 'express-useragent';
import ejsLayouts from 'express-ejs-layouts';

// Import necessary Core modules
import path from 'path';

// Import necessary internal modules
import './config/passport.config.js'; // Configure Passport Strategies
import userRouter from './Routes/user.routes.js';
import homeRouter from './Routes/home.routes.js';
import sessionMiddleware from './Middlewares/session.middleware.js';
import handleGlobalErrors from './Middlewares/globalErrorHandler.middleware.js';
import handleInvalidRoute from './Middlewares/invalidRouteHandler.middleware.js';
import passport from 'passport';

// Initialize application
const app = express();

app.set('view engine', 'ejs'); // Set EJS as view-engine
app.set('views', path.join(path.resolve(), 'views')); // Set views path
app.set('layout', './layouts/main'); // Set the default layout for the application

app.use(flash()); // Use flash messages
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse incoming JSON bodies
app.use(userAgent.express()); // Parse user-agent information
app.use(ejsLayouts); // Use EJS layouts for redering views with layouts
app.use(express.static(path.join(path.resolve(), 'public'))); // Setup Public files
app.use(express.urlencoded({ extended: true })); //parse URL-encoded form data

app.use(sessionMiddleware); // Use express-session
app.use(passport.initialize()); // Initialize passport to use it's Strategies for logins
app.use(passport.session()); // Attach user doc to the request

// Use homeRouter for handling Home related requests
app.get('/', homeRouter);

// Use userRouter for handling user related requests
app.use('/user', userRouter);

// Handle invalid routes
app.use(handleInvalidRoute);

// Handle all application errors
app.use(handleGlobalErrors);

export default app;
