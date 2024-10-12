// Import necessary External modules
import express from 'express';
import cors from 'cors';
import userAgent from 'express-useragent';

// Import necessary internal modules
import userRouter from './Routes/user.routes.js';
import welcomeUser from './Middlewares/welcomeUser.middleware.js';
import handleGlobalErrors from './Middlewares/globalErrorHandler.middleware.js';
import handleInvalidRoute from './Middlewares/invalidRouteHandler.middleware.js';

// Initialize application
const app = express();

app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse incoming JSON bodies
app.use(userAgent.express()); // Parse user-agent information
app.use(express.urlencoded({ extended: true })); //parse URL-encoded form data

// Welcome user on Root route
app.get('/', welcomeUser);

// Use userRouter for handling user related requests
app.use('/user', userRouter);

// Handle invalid routes
app.use(handleInvalidRoute);

// Handle all application errors
app.use(handleGlobalErrors);

export default app;
