const Project = require('../models/Project');
const catchAsyncErrors = require('../middlewares/catchAsyncError'); // For handling async errors
const ErrorHandler = require('../utils/errorHandler'); // For custom error handling
const APIFeatures = require('../utils/apiFeatures'); // For advanced querying (search, filter, pagination)

// Create new project => /api/v1/admin/projects/new
exports.newProject = catchAsyncErrors(async (req, res, next) => {
  // Destructure data from the request body
  const { title, description, imageUrl, liveDemoUrl, githubRepoUrl } = req.body;

  // Validate if required fields are present
  if (!title || !description) {
    return next(new ErrorHandler("Title and description are required!", 400));
  }

  // Create a new project in the database
  const project = await Project.create({
    title,
    description,
    imageUrl,
    liveDemoUrl,
    githubRepoUrl,
  });

  // Respond with success
  res.status(201).json({
    success: true,
    message: "Project created successfully!",
    project,
  });
});

// Get all projects => /api/v1/projects
exports.getProjects = catchAsyncErrors(async (req, res, next) => {
  // Set a default value for results per page
  const resPerPage = 6; 

  // Use APIFeatures for search, filter, and pagination
  const apiFeatures = new APIFeatures(Project.find(), req.query)
    .search() // Search by keyword
    .filter() // Filter by fields like price, rating, etc.
    .pagination(resPerPage); // Apply pagination

  const projects = await apiFeatures.query;

  // Count the total number of projects for pagination
  const projectCount = await Project.countDocuments();

  res.status(200).json({
    success: true,
    projectCount,
    projects,
    resPerPage,
  });
});

// Update project => /api/v1/admin/projects/:id
exports.updateProject = catchAsyncErrors(async (req, res, next) => {
  const { title, description, imageUrl, liveDemoUrl, githubRepoUrl } = req.body;

  // Check if the project exists in the database
  let project = await Project.findById(req.params.id);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  // Update the project with the new data
  project = await Project.findByIdAndUpdate(
    req.params.id,
    { title, description, imageUrl, liveDemoUrl, githubRepoUrl },
    { new: true, runValidators: true }
  );

  // Send the updated project as the response
  res.status(200).json({
    success: true,
    message: "Project updated successfully!",
    project,
  });
});


// Delete project => /api/v1/admin/projects/:id
exports.deleteProject = catchAsyncErrors(async (req, res, next) => {
  // Check if the project exists
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  // Delete the project
  await project.remove();

  res.status(200).json({
    success: true,
    message: "Project deleted successfully!",
  });
});

