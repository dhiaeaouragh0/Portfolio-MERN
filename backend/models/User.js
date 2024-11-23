const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
        unique: true,
        minlength: [5, 'Your name must be at least 5 characters'],
        maxlength: [30, 'Your name cannot exceed 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Please enter your email address'],
        unique: true,
        validate: [validator.isEmail, 'Please enter a valid email address']
    },
    password: {
        type: String,
        minlength: [6, 'Your password must be at least 6 characters'],
        select: false // Password is excluded from queries by default
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // Only allow "user" or "admin"
        default: 'user', // Default role is "user"
    },
    googleId: {
        type: String, // Store Google account ID for OAuth users
        unique: true,
        sparse: true, // Allows for users who don't use Google
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetTokenExpiration: Date
});

// Encrypt password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    this.password = await bcrypt.hash(this.password, 10);
});

// Compare user password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Return JWT token
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    });
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetTokenExpiration = Date.now() + 30 * 60 * 1000; // 10 minutes

    return resetToken;
};

module.exports = mongoose.model('User', userSchema);
