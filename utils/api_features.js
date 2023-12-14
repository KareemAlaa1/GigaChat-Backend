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
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
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
}
exports.paginate = (elements, req) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.count * 1 || 100;
  const skip = (page - 1) * limit;

  const totalElementsNum = elements.length;

  console.log('page :', page);
  console.log('count :', limit);
  console.log('totalElementNum: ', totalElementsNum);
  console.log('skip: ', skip);
  if (totalElementsNum <= skip || elements.length == 0) {
    throw new Error('No content is found in this page ');
  }
  const paginatedElements = elements.slice(skip, skip + limit);
  return paginatedElements;
};

// module.exports = APIFeatures;
