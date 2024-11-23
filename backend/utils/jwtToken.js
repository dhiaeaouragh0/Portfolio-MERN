// Create and send token and save in the cookie
const sendToken = (user, statusCode, res) => {
    // Create JWT token
    const token = user.getJwtToken();

    // Remove the password from the user object
    const { password: _, ...userWithoutPassword } = user._doc;

    // Options for the cookie
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
        user: userWithoutPassword, // Send sanitized user object
    });
};

module.exports = sendToken;
