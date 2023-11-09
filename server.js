const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config/dev.env' });
const app = require('./app');


const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
}); // the result of calling app.listen is a server
