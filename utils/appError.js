class AppError extends Error { // inherit from the built-in error class
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // to differ the operational error from any other programming error
    Error.captureStackTrace(this, this.constructor); // is used to capture the stack trace of the error object.
  }
}

module.exports = AppError;
