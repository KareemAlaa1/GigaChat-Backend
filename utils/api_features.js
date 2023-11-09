const arrayFeatures = require('./features/arrayFeature');
const mongooseFeatures = require('./features/mongooseFeature');

// Factory: CarFactory
class APIFeatures {
  constructor(query, queryString) {
    switch (queryString.type) {
      case 'array':
        return new arrayFeatures(query, queryString);
      default:
        return new mongooseFeatures(query, queryString);
    }
  }
}
module.exports = APIFeatures;
