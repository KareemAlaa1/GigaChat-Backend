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
