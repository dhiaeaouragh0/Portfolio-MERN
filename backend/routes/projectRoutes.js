const express = require('express');
const multer = require('multer');  // Import multer to handle file uploads
const router = express.Router();

const {
  newProject,
  getProjects,
  updateProject,
  deleteProject,
  getSingleProject,
} = require('../controllers/projectController');

// Import authentication and authorization middlewares
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// Set up multer for handling file uploads
const storage = multer.memoryStorage(); // Using memoryStorage to upload files directly to Cloudinary
const upload = multer({ storage }).array('images'); // Expecting multiple images under 'images' field

// POST route to create a new project (only accessible by admin)
router.route('/admin/projects/new')
  .post(upload, newProject);  // Use multer upload middleware before the controller

router.route('/projects').get(getProjects);
router.route('/projects/:id').get(getSingleProject);


router.route('/admin/projects/:id')
  .put(upload, updateProject)
  .delete(deleteProject);


// DELETE route to delete a project by ID (only accessible by admin)
// router.route('/admin/projects/:id')
//   .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProject);

module.exports = router;
