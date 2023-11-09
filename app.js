const express = require('express');
const morgan = require('morgan');
require('./db/mongoose');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
// app.use(express.static(`${__dirname}/public`));// for static data in public
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Handling  Wrong Route Req.

//  ROUTES
// app.use('/api/v1/users', userRouter);
app.use('/api/user', userRouter);

// Handling  Wrong Route Req. 
app.all('*', (req, res, next) => {
  //create ourError obj and send it
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler); // the final middleWare for express

module.exports = app;
