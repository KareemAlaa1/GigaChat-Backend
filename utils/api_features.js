const skipAndLimit = require('./skip_limit');
const sortByProperties = require('./sort_by_properties');
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      if (this.query.type === 'array') {
        this.query = sortByProperties(this.query, sortBy);
      } else {
        this.query = this.query.sort(sortBy);
      }
    } else {
      if (this.query.type === 'array') {
        this.query = this.query.sort((a, b) => a.createdAt - b.createdAt);
      } else {
        this.query = this.query.sort('-createdAt');
      }
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    if (this.query.type === 'array') {
      const skippedArray = this.query.slice(skip);
      const limitedArray = limit ? skippedArray.slice(0, limit) : skippedArray;
      this.query = limitedArray;
    } else {
      this.query = this.query.skip(skip).limit(limit);
    }
    return this;
  }
}
module.exports = APIFeatures;
