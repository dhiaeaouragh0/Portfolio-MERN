class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message); // Pass the message to the Error constructor
        this.statusCode = statusCode; // Add a custom statusCode

        Error.captureStackTrace(this, this.constructor); // Captures the stack trace for debugging
    }
}

module.exports = ErrorHandler;
