class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;

        // Capturing the stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ErrorHandler;
