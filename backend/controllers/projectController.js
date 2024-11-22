const cloudinary = require('../utils/cloudinary');
const Project = require('../models/Project');
const catchAsyncErrors = require('../middlewares/catchAsyncError');
const ErrorHandler = require('../utils/errorHandler');
const APIFeatures = require('../utils/apiFeatures');

// Create new project => /api/v1/admin/projects/new
exports.newProject = catchAsyncErrors(async (req, res, next) => {
  // Extract fields from body
  const { title, description, liveDemoUrl, githubRepoUrl } = req.body;

  // Validate required fields (title and description)
  if (!title || !description) {
    return next(new ErrorHandler('Title and description are required!', 400));
  }

  // Debug logs for incoming data
  console.log('Request Body:', req.body);
  console.log('Request Files:', req.files);

  // Handle image upload to Cloudinary
  let uploadedImages = [];
  if (req.files && req.files.length > 0) {
    console.log('Processing images...');
    for (let file of req.files) {
      console.log('Uploading:', file.originalname);
      try {
        // Use upload_stream to handle the file buffer
        const uploadPromise = () =>
          new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: 'portfolio/projects' },
              (error, result) => {
                if (error) return reject(error);
                resolve(result);
              }
            );
            uploadStream.end(file.buffer); // Send the file buffer to the stream
          });
  
        const result = await uploadPromise();
        console.log('Uploaded:', result.secure_url);
        uploadedImages.push({ public_id: result.public_id, url: result.secure_url });
      } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        return next(new ErrorHandler('Image upload failed', 500));
      }
    }
  } else {
    console.log('No files found in the request.');
  }

  // Save the new project to the database
  const project = await Project.create({
    title,
    description,
    liveDemoUrl,
    githubRepoUrl,
    images: uploadedImages, // Store uploaded images
  });

  // Send success response
  res.status(201).json({
    success: true,
    message: 'Project created successfully!',
    project,
  });
});
























// Get all projects => /api/v1/projects
exports.getProjects = catchAsyncErrors(async (req, res, next) => {
  const resPerPage = 6; // Define results per page

  // Use APIFeatures for advanced querying
  const apiFeatures = new APIFeatures(Project.find(), req.query)
    .search()
    .filter()
    .pagination(resPerPage);

  const projects = await apiFeatures.query;

  // Count total projects
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
  let project = await Project.findById(req.params.id);

  if (!project) {
    return next(new ErrorHandler('Project not found!', 404));
  }

  const { title, description, liveDemoUrl, githubRepoUrl } = req.body;

  // Handle image updates
  if (req.body.images) {
    // Delete existing images on Cloudinary
    for (let image of project.images) {
      await cloudinary.uploader.destroy(image.public_id);
    }

    // Upload new images
    let images = [];
    if (Array.isArray(req.body.images)) {
      for (let image of req.body.images) {
        const result = await cloudinary.uploader.upload(image, {
          folder: 'portfolio/projects',
        });
        images.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }
    } else {
      const result = await cloudinary.uploader.upload(req.body.images, {
        folder: 'portfolio/projects',
      });
      images.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = images;
  }

  // Update project fields
  project = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Project updated successfully!',
    project,
  });
});

// Delete project => /api/v1/admin/projects/:id
exports.deleteProject = catchAsyncErrors(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new ErrorHandler('Project not found!', 404));
  }

  // Delete associated images from Cloudinary
  for (let image of project.images) {
    await cloudinary.uploader.destroy(image.public_id);
  }

  // Delete the project from the database
  await project.remove();

  res.status(200).json({
    success: true,
    message: 'Project deleted successfully!',
  });
});
