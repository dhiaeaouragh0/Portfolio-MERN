const express = require('express');
const helmet = require('helmet');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const projectRoutes = require('./routes/projectRoutes'); // Import the project routes
const userRoutes = require('./routes/userRoutes'); // Import the user routes

dotenv.config();

const app = express();

app.use(helmet());
app.use(cookieParser());
const errorMiddleware = require('./middlewares/errors');

// Middleware to parse incoming JSON requests
app.use(express.json());

// Mount routes
app.use('/api/v1', projectRoutes); // Mount the project routes under the /api/v1 prefix
app.use('/api/v1', userRoutes); // Mount user routes under the /api/v1/auth prefix

// Test route to ensure everything is working
app.get('/', (req, res) => {
  res.send('Portfolio API is running...');
});

// Middleware to handle errors
app.use(errorMiddleware);

module.exports = app;
