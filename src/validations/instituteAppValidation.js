const { check, param } = require("express-validator");

exports.myCoursesList = [
    check('countryCode')
        .notEmpty().withMessage('Country code is required')
        .isLength({ min: 2, max: 3 }).withMessage('Country code must be 2 or 3 characters long'),
    check('countryCodeName')
        .notEmpty().withMessage('Country name is required')
        .isLength({ max: 100 }).withMessage('Country name must be at most 100 characters long'),
    check('phone')
        .notEmpty().withMessage('Phone number is required')
        .isMobilePhone().withMessage('Phone number must be a valid mobile phone number')
        .isLength({ max: 20 }).withMessage('Phone number must be at most 20 characters long'),    check('instituteCourseId')
        .optional()
        .isMongoId()
        .withMessage('Invalid instituteCourseId'),
    check('instituteSubCourseId')
        .optional()
        .isMongoId()
        .withMessage('Invalid instituteSubCourseId'),
    check('batchId')
        .optional()
        .isMongoId()
        .withMessage('Invalid batchId'),    check('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    check('limit')
        .optional()
        .isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
];

exports.mySubCoursesList = [
    check('countryCode')
        .notEmpty().withMessage('Country code is required')
        .isLength({ min: 2, max: 3 }).withMessage('Country code must be 2 or 3 characters long'),
    check('countryCodeName')
        .notEmpty().withMessage('Country name is required')
        .isLength({ max: 100 }).withMessage('Country name must be at most 100 characters long'),
    check('phone')
        .notEmpty().withMessage('Phone number is required')
        .isMobilePhone().withMessage('Phone number must be a valid mobile phone number')
        .isLength({ max: 20 }).withMessage('Phone number must be at most 20 characters long'),    check('instituteCourseId')
        .optional()
        .isMongoId()
        .withMessage('Invalid instituteCourseId'),
    check('instituteSubCourseId')
        .optional()
        .isMongoId()
        .withMessage('Invalid instituteSubCourseId'),
    check('batchId')
        .optional()
        .isMongoId()
        .withMessage('Invalid batchId'),
    check('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    check('limit')
        .optional()
        .isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
];

exports.myLectureList = [
    check('countryCode')
        .notEmpty().withMessage('Country code is required')
        .isLength({ min: 2, max: 3 }).withMessage('Country code must be 2 or 3 characters long'),
    check('countryCodeName')
        .notEmpty().withMessage('Country name is required')
        .isLength({ max: 100 }).withMessage('Country name must be at most 100 characters long'),
    check('phone')
        .notEmpty().withMessage('Phone number is required')
        .isMobilePhone().withMessage('Phone number must be a valid mobile phone number')
        .isLength({ max: 20 }).withMessage('Phone number must be at most 20 characters long'),
    check('type')
        .optional()
        .isIn(['all', 'upcoming']).withMessage('Type must be either all or upcoming'),
    check('instituteCourseId')
        .optional()
        .isMongoId()
        .withMessage('Invalid instituteCourseId'),
    check('instituteSubCourseId')
        .optional()
        .isMongoId()
        .withMessage('Invalid instituteSubCourseId'),
    check('batchId')
        .optional()
        .isMongoId()
        .withMessage('Invalid batchId'),
    check('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    check('limit')
        .optional()
        .isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
]; 

exports.myBatchesList = [
    check('countryCode')
        .notEmpty().withMessage('Country code is required')
        .isLength({ min: 2, max: 3 }).withMessage('Country code must be 2 or 3 characters long'),
    check('countryCodeName')
        .notEmpty().withMessage('Country name is required')
        .isLength({ max: 100 }).withMessage('Country name must be at most 100 characters long'),
    check('phone')
        .notEmpty().withMessage('Phone number is required')
        .isMobilePhone().withMessage('Phone number must be a valid mobile phone number')
        .isLength({ max: 20 }).withMessage('Phone number must be at most 20 characters long'),
    check('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    check('limit')
        .optional()
        .isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
];

exports.otherCoursesList = [
    check('countryCode')
        .notEmpty().withMessage('Country code is required')
        .isLength({ min: 2, max: 3 }).withMessage('Country code must be 2 or 3 characters long'),
    check('countryCodeName')
        .notEmpty().withMessage('Country name is required') 
        .isLength({ max: 100 }).withMessage('Country name must be at most 100 characters long'),
    check('phone')
        .notEmpty().withMessage('Phone number is required')
        .isMobilePhone().withMessage('Phone number must be a valid mobile phone number')
        .isLength({ max: 20 }).withMessage('Phone number must be at most 20 characters long'),
    check('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    check('limit')
        .optional()
        .isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
];

exports.myMaterialList = [
    check('countryCode')
        .notEmpty().withMessage('Country code is required')
        .isLength({ min: 2, max: 3 }).withMessage('Country code must be 2 or 3 characters long'),
    check('countryCodeName')
        .notEmpty().withMessage('Country name is required')
        .isLength({ max: 100 }).withMessage('Country name must be at most 100 characters long'),
    check('phone')
        .notEmpty().withMessage('Phone number is required')
        .isMobilePhone().withMessage('Phone number must be a valid mobile phone number')
        .isLength({ max: 20 }).withMessage('Phone number must be at most 20 characters long'),
    check('instituteCourseId')
        .optional()
        .isMongoId()
        .withMessage('Invalid instituteCourseId'),
    check('instituteSubCourseId')
        .optional()
        .isMongoId()
        .withMessage('Invalid instituteSubCourseId'),
    check('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    check('limit')
        .optional()
        .isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
];

exports.myLectureMaterialList = [
    check('countryCode')
        .notEmpty().withMessage('Country code is required')
        .isLength({ min: 2, max: 3 }).withMessage('Country code must be 2 or 3 characters long'),
    check('countryCodeName')
        .notEmpty().withMessage('Country name is required')
        .isLength({ max: 100 }).withMessage('Country name must be at most 100 characters long'),
    check('phone')
        .notEmpty().withMessage('Phone number is required')
        .isMobilePhone().withMessage('Phone number must be a valid mobile phone number')
        .isLength({ max: 20 }).withMessage('Phone number must be at most 20 characters long'),
    check('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    check('limit')
        .optional()
        .isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
];