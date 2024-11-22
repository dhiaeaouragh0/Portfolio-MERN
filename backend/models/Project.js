const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title for the project"],
    },
    description: {
      type: String,
      required: [true, "Please add a description for the project"],
    },
    imageUrl: {
      type: String,
      required: false
    },
    liveDemoUrl: {
      type: String,
      required: false, // Optional
    },
    githubRepoUrl: {
      type: String,
      required: false, // Optional
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
