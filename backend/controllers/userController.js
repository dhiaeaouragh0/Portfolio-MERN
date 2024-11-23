const User = require('../models/User');
const catchAsyncErrors = require('../middlewares/catchAsyncError');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwtToken');

// Register a new user => /api/v1/register
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return next(new ErrorHandler('Please provide all required fields', 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new ErrorHandler('Email is already registered', 400));
    }

    const userRole = role || 'user';

    const user = await User.create({
        name,
        email,
        password,
        role: userRole,
    });

    sendToken(user, 201, res); // Automatically removes password in the response
});




// Login a user => /api/v1/login
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    // Ensure email and password are provided
    if (!email || !password) {
        return next(new ErrorHandler('Please enter email and password', 400));
    }

    // Find the user by email
    const user = await User.findOne({ email }).select('+password'); // Include password field in the query result
    if (!user) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }

    // Check if the password matches
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }

    // Send JWT token in response
    sendToken(user, 200, res); // Sends the token and user object without password
});


// Admin: Get all users
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        success: true,
        count: users.length,
        users,
    });
});

// Admin: Delete a user
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    await user.remove();
    res.status(200).json({
        success: true,
        message: 'User deleted successfully',
    });
});

exports.logoutUser = (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
};


// userController.js

exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id); // Getting user from the request (attached from the JWT)

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    res.status(200).json({
        success: true,
        user
    });
});


// userController.js

exports.updateUserProfile = catchAsyncErrors(async (req, res, next) => {
    const { name, email } = req.body;

    // Find the user and update
    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    // Update user details
    user.name = name || user.name;
    user.email = email || user.email;

    // Save the updated user
    await user.save();

    res.status(200).json({
        success: true,
        message: 'User profile updated successfully',
        user
    });
});


// userController.js

exports.changePassword = catchAsyncErrors(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    // Find the user
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    // Check if the current password matches
    const isPasswordMatched = await user.comparePassword(currentPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHandler('Current password is incorrect', 400));
    }

    // Set the new password
    user.password = newPassword;

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password updated successfully'
    });
});

const sendEmail = require('../utils/sendEmail'); // Path to the sendEmail.js utility
const crypto = require('crypto');

// Forgot password controller
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const { email } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
        return next(new ErrorHandler('No user found with this email', 404));
    }

    // Generate a password reset token
    const resetToken = user.getResetPasswordToken(); // Assuming you have this method in your User model

    // Save the user with the reset token (make sure you save the token and its expiration time)
    await user.save({ validateBeforeSave: false });

    // Create a reset link
    const resetLink = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    // Styled email message (HTML)
    const message = `
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px; color: #333;">
                <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                    <h1 style="color: #333; text-align: center; font-size: 24px; font-weight: bold;">Password Reset Request</h1>
                    <p style="font-size: 16px; color: #555;">Hello,</p>
                    <p style="font-size: 16px; color: #555;">If you requested a password reset, click the link below to reset your password:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 18px;">Reset Password</a>
                    </div>
                    <p style="font-size: 16px; color: #555;">If you did not request a password reset, please ignore this email.</p>
                    <p style="font-size: 14px; color: #777;">This is an automated message, please do not reply.</p>
                    <p style="font-size: 14px; color: #777;">"${resetLink}"</p>
                </div>
            </body>
        </html>
    `;

    try {
        await sendEmail(user.email, 'Password Reset Request', message, true); // Pass true to indicate HTML email
        res.status(200).json({
            success: true,
            message: 'Password reset link has been sent to your email',
        });
    } catch (error) {
        // Reset the password reset token if email sending fails
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler('Email could not be sent', 500));
    }
});

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    //Hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    // const resetPasswordToken = req.params.body

    const user = await User.findOne({
        resetPasswordToken,
        resetTokenExpiration: {$gt: Date.now()}
        
    })

    if(!user) {
        return next(new ErrorHandler('Invalid token or token expired',400));
    }

    // Setup new password
    user.password = req.body.password
    
    user.resetPasswordToken = undefined
    user.resetTokenExpiration = undefined

    await user.save()

    sendToken(user,200,res)
})




// userController.js

exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'User deleted successfully'
    });
});


// userController.js

exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    // Update the role
    user.role = req.body.role || user.role;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'User role updated successfully',
        user
    });
});
