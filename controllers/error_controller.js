const sendErrorDev = (err, res) => {
  // we will send all possible info about the errer
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};


// GlobalErrorHandler
module.exports = (err, req, res, next) => {
  // usual lines we talk about
  err.statusCode = err.statusCode || 500;// internal program error
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    //TODO latter
  }
};
