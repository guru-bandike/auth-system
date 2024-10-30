import './env.js';
import app from './app.js';
import { connectToDB } from './config/db.config.js';

// Get PORT
const port = process.env.PORT || 3000;

// Connect to DB
await connectToDB();

// Start Server
app.listen(port, () => console.log('Server is listening on ' + port));
