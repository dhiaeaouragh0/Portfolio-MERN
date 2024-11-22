const app = require('./app'); // Import app.js where routes and middleware are set
const mongoose = require('mongoose'); // Import mongoose to connect to MongoDB
const dotenv = require('dotenv'); // To load environment variables
const cors = require('cors'); // Enable cross-origin requests (optional, but useful for frontend)

dotenv.config(); // Load environment variables from .env file

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("MongoDB connection error: ", err));

// Use CORS middleware to allow cross-origin requests if needed
app.use(cors());

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
