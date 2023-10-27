module.exports = (fn) => (req, res, next) =>
  fn(req, res, next).catch((err) => next(err));
// wrap your async code with this function and you will not be have to use the ugly try catch block
