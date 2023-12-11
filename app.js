const dotenv = require('dotenv');
dotenv.config({ path: './config/dev.env' });
const cookieSession = require("cookie-session");
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const AppError = require('./utils/app_error');
const globalErrorHandler = require('./controllers/error_controller');
const userRouter = require('./routes/user_routes');
const userProfileRouter = require('./routes/user_profile_router');
const tweetRouter = require('./routes/tweet_routes');
const homepageRouter = require('./routes/homepage_router');
const hashtagRouter = require('./routes/hashtag_router');
const mediaRouter = require('./routes/media_routes');
const googleRouter = require('./routes/google_router');
const passportSetup = require("./google-passport");
const passport = require("passport");
const app = express();
// MIDDLEWARES

app.use(cors());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
// app.use(express.static(`${__dirname}/public`));// for static data in public
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});


//region google-router
app.use(
    cookieSession({ name: "google-passport-session", keys: ["google-auth"], maxAge: 24 * 60 * 60 * 100 })
);

app.use(passport.initialize());
app.use(passport.session());


app.use("/auth", googleRouter);
//endregion google-router

// Handling  Wrong Route Req.
//Routs

app.use('/api/user', userRouter);
app.use('/api/homepage', homepageRouter);
app.use('/api/trends', hashtagRouter);
app.use('/api/tweets', tweetRouter);
app.use('/api/profile', userProfileRouter);
app.use('/api/media', mediaRouter);

// Handling  Wrong Route Req.
app.all('*', (req, res, next) => {
  //create ourError obj and send it
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler); // the final middleWare for express

module.exports = app;
