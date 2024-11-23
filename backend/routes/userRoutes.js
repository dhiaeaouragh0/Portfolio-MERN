const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    logoutUser,
    getAllUsers,
    getUserProfile,updateUserProfile,changePassword
     ,forgotPassword ,resetPassword ,deleteUser ,updateUserRole
} = require('../controllers/userController');


const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/authMiddleware');
const { registrationRateLimiter, loginRateLimiter } = require('../middlewares/rateLimiter');
const { validateUserRegistration, checkValidation } = require('../middlewares/validationMiddleware');

// Public routes
router.route('/register')
    .post(
        registrationRateLimiter, // Apply rate limiting
        validateUserRegistration, // Apply registration validation
        checkValidation, // Check if validation passed
        registerUser // Register user if validation passes
    );

router.route('/login')
    .post(
        loginRateLimiter, // Apply rate limiting
        loginUser // Handle login
    );

router.route('/logout').get(logoutUser);

// Protected routes (Admin only)
router.route('/admin/users')
    .get(isAuthenticatedUser, authorizeRoles('admin'), getAllUsers);


// In userRoutes.js

router.route('/me')
    .get(isAuthenticatedUser, getUserProfile) // View own profile

router.route('/me/update')
    .put(isAuthenticatedUser, updateUserProfile) // Update own profile

router.route('/password/update')
    .put(isAuthenticatedUser, changePassword) // Change password

router.route('/forgotpassword')
    .post(forgotPassword) // Forgot password

router.route('/resetpassword/:token')
    .put(resetPassword) // Reset password using token

// Admin routes for user management
router.route('/admin/user/:id')
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteUser)
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateUserRole);










module.exports = router;
