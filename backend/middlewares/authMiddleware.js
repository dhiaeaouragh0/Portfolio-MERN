const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('./catchAsyncError');

// Middleware to verify if the user is authenticated
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    let token;

    // Get token from cookies or Authorization header
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new ErrorHandler('You must be logged in to access this resource', 401));
    }

    // Verify token
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    req.user = await User.findById(decodedData.id);
    next();
});


// Middleware to authorize roles (e.g., admin-only routes)
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler('You do not have permission to access this resource', 403));
        }
        next();
    };
};
