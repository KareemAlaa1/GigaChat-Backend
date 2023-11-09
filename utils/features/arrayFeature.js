const skipAndLimit = require('../skip_limit');
const sortByProperties = require('../sort_by_properties');

class arrayFeatures {
  //constructor to initialize the arrrayFeature object with array of objects and its query to apply
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // can sort based on given properties
  // if not supplied with property to sort on it use descending created at
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = sortByProperties(this.query, sortBy);
    } else this.query = this.query.sort((a, b) => a.createdAt - b.createdAt);
    return this;
  }

  // select witch fields to display
  // req.query   fields      name,age,...
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',');
      this.query = this.query.map((obj) => {
        const selectedFields = {};
        fields.forEach((field) => {
          selectedFields[field] = obj[field];
        });
        return selectedFields;
      });
    }
    return this;
  }

  // excludes fields from displaying
  // req.query   excludes      name,age,...
  excludeFields() {
    if (this.queryString.excludes) {
      const excludes = this.queryString.excludes.split(',');
      this.query = this.query.map((obj) => {
        const selectedFields = obj;
        excludes.forEach((exclude) => {
          selectedFields[`${exclude}`] = undefined;
        });
        return selectedFields;
      });
    }
    return this;
  }

  // view parts of result according to the page and limit amounts
  // req.query     page    2      limit     3
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    const skippedArray = this.query.slice(skip);
    const limitedArray = limit ? skippedArray.slice(0, limit) : skippedArray;
    this.query = limitedArray;

    return this;
  }
}

module.exports = arrayFeatures;
