skipAndLimit = (skip, limit) => {
  const skippedArray = this.dataArray.slice(skip);
  const limitedArray = limit ? skippedArray.slice(0, limit) : skippedArray;
  this.dataArray = limitedArray;
  return this;
};

module.exports = skipAndLimit;
