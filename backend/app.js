const express = require('express');
const dotenv = require('dotenv');
const projectRoutes = require('./routes/projectRoutes'); // Import the project routes

dotenv.config();

const app = express();
const errorMiddleware = require('./middlewares/errors')
// Middleware to parse incoming JSON requests
app.use(express.json());

// Use the project routes
app.use('/api/v1', projectRoutes); // Mount the project routes under the /api/v1 prefix

// Test route to ensure everything is working
app.get('/', (req, res) => {
  res.send('Portfolio API is running...');
});

//Middleware to handle errors
app.use(errorMiddleware);

module.exports = app;
