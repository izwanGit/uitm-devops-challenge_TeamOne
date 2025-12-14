const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

const propertyValidationRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),

  body('address').trim().notEmpty().withMessage('Address is required'),

  body('city').trim().notEmpty().withMessage('City is required'),

  body('state').trim().notEmpty().withMessage('State is required'),

  body('zipCode')
    .trim()
    .notEmpty()
    .withMessage('Zip code is required')
    .isPostalCode('any') // Supports various locales, 'any' is safe for general use
    .withMessage('Invalid zip code format'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('currencyCode')
    .optional()
    .isISO4217()
    .withMessage('Invalid currency code'),

  body('bedrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bedrooms must be a non-negative integer'),

  body('bathrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bathrooms must be a non-negative integer'),

  body('areaSqm')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Area must be a positive number'),

  body('propertyTypeId')
    .notEmpty()
    .withMessage('Property Type ID is required')
    .isUUID()
    .withMessage('Invalid Property Type ID format'),
];

module.exports = {
  validate,
  propertyValidationRules,
};
