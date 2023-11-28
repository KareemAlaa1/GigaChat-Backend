
const dotenv = require('dotenv');
dotenv.config({ path: './config/dev.env' });
require('./db/mongoose');
const app = require('./app');

  const port = process.env.PORT || 3000;
  const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
  
});

module.exports = server;