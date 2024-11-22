const express = require('express');
const router = express.Router();

const {
  newProject,
  getProjects,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// Create a new project (No authentication needed for public projects)
router.route('/projects').post(newProject); // Create a new project
router.route('/projects').get(getProjects); // Get all projects

// Admin routes for update and delete project
router.route('/admin/projects/:id')
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateProject)  // Admin route to update a project
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProject); // Admin route to delete a project

module.exports = router;
