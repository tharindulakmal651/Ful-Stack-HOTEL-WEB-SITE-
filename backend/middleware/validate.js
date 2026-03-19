const { validationResult } = require('express-validator');

/**
 * Reusable middleware that reads express-validator results
 * and returns 422 with the first error message if any exist.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: errors.array()[0].msg,
      errors:  errors.array()
    });
  }
  next();
};

module.exports = validate;
