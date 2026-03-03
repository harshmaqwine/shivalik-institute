const { check, param } = require("express-validator");

exports.create = [
    check('batchId')
        .notEmpty().withMessage('Batch Id is required')
        .isMongoId().withMessage('Batch Id must be a valid MongoDB ObjectId'),
    check('name')
        .notEmpty().withMessage('Name is required')
        .isLength({ max: 100 }).withMessage('Name must be at most 100 characters long'),
    check('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Email must be a valid email address')
        .isLength({ max: 100 }).withMessage('Email must be at most 100 characters long'),
    check('phone')
        .notEmpty().withMessage('Phone number is required')
        .isMobilePhone().withMessage('Phone number must be a valid mobile phone number')
        .isLength({ max: 20 }).withMessage('Phone number must be at most 20 characters long'),
];

exports.list = [ 
    check('batchId')
        .optional()
        .isMongoId().withMessage('Batch Id must be a valid MongoDB ObjectId'),
    check('status')
        .optional()
        .isIn(['active', 'inactive']).withMessage('Status must be either active or inactive'),
    check('name')
        .optional()
        .isLength({ max: 100 }).withMessage('Name must be at most 100 characters long'),
    check('email')
        .optional()
        .isEmail().withMessage('Email must be a valid email address')
        .isLength({ max: 100 }).withMessage('Email must be at most 100 characters long'),
    check('phone')
        .optional()
        .isMobilePhone().withMessage('Phone number must be a valid mobile phone number')
        .isLength({ max: 20 }).withMessage('Phone number must be at most 20 characters long'),
    check('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    check('limit')
        .optional()
        .isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    check('sortBy')
        .optional()
        .isIn(['name', 'email', 'phone', 'status', 'createdAt']).withMessage('SortBy must be one of name, email, phone, status, createdAt'),
    check('sortOrder')
        .optional()
        .isIn(['asc', 'desc']).withMessage('SortOrder must be either asc or desc'),
    check('search')
        .optional()
        .isString().withMessage('Search must be a string')
        .isLength({ max: 100 }).withMessage('Search must be at most 100 characters long'),
];

exports.detail = [
    param('studentId')
        .notEmpty().withMessage('Student Id is required')
        .isMongoId().withMessage('Student Id must be a valid MongoDB ObjectId'),
];

exports.update = [
    check('studentId')
        .notEmpty().withMessage('Student Id is required')
        .isMongoId().withMessage('Invalid Student Id'),

    check('batchId')
        .optional()
        .isMongoId().withMessage('Batch Id must be valid'),

    check('name')
        .optional()
        .isLength({ max: 100 }).withMessage('Name max 100 characters'),

    check('email')
        .optional()
        .isEmail().withMessage('Invalid email'),

    check('phone')
        .optional()
        .isLength({ max: 20 }).withMessage('Phone max 20 characters'),

    check('status')
        .optional()
        .isIn(['ACTIVE', 'INACTIVE']).withMessage('Invalid status')
];

exports.delete = [
    param('studentId')
        .notEmpty().withMessage('Student Id is required')
        .isMongoId().withMessage('Invalid Student Id'),
];

exports.batchDropdownList = [
    check('search')
        .optional()
        .isString().withMessage('Search must be a string')
        .isLength({ max: 100 }).withMessage('Search must be at most 100 characters long'),
];