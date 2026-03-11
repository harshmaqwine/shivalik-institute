const { check, param } = require("express-validator");

exports.getModulesList = [ 
  // pagination
  check('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive number')
    .toInt(),
  check('limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Limit must be a positive number')
    .toInt(),

  // sorting
  check('sortBy').optional(),
  check('sort')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort must be asc or desc'),

  // filters
  check('instituteCourseId')
    .optional()
    .isMongoId()
    .withMessage('Invalid instituteCourseId'),
  check('instituteSubCourseId')
    .optional()
    .isMongoId()
    .withMessage('Invalid instituteSubCourseId'),
  check('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE']).withMessage('Status must be either ACTIVE or INACTIVE'),
  check('search')
    .optional()
    .isString().withMessage('Search must be a string')
    .isLength({ max: 100 }).withMessage('Search must be at most 100 characters long'),
];