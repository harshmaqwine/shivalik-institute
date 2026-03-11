const { check, param } = require("express-validator");

exports.create = [
    check('CourseId')
        .optional()
        .isMongoId().withMessage('Course Id must be a valid MongoDB ObjectId'),
    check('batchId')
        .optional({ nullable: true })
        .isMongoId()
        .withMessage('Batch Id must be a valid MongoDB ObjectId'),
    check('prefixName')
        .optional({ nullable: true, checkFalsy: true })
        .customSanitizer(val => typeof val === 'string' ? val.toUpperCase() : val)
        .isIn(['MR', 'MRS', 'MISS', 'DR', 'CA', 'AR', 'ADV']).withMessage('Prefix must be one of MR, MRS, MISS, DR, CA, AR, ADV'),
    check('firstName')
        .notEmpty().withMessage('First name is required')
        .isLength({ max: 100 }).withMessage('First name must be at most 100 characters long'),
    check('lastName')
        .notEmpty().withMessage('Last name is required')
        .isLength({ max: 100 }).withMessage('Last name must be at most 100 characters long'),
    check('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Email must be a valid email address')
        .isLength({ max: 100 }).withMessage('Email must be at most 100 characters long'),
    check('phone')
        .notEmpty().withMessage('Phone number is required')
        .isMobilePhone().withMessage('Phone number must be a valid mobile phone number')
        .isLength({ max: 20 }).withMessage('Phone number must be at most 20 characters long'),
    check('enrollmentNo')
        .optional({ checkFalsy: true })
        .matches(/^SIRE\d{5}$/)
        .withMessage('Enrollment number must match format SIRE00001'),
    check('gender')
        .notEmpty().withMessage('Gender is required')
        .customSanitizer(val => typeof val === 'string' ? val.toUpperCase() : val)
        .isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Gender must be one of MALE, FEMALE or OTHER'),
    check('age')
        .notEmpty().withMessage('Age is required')
        .isInt({ min: 0 }).withMessage('Age must be a non-negative integer'),
    check('state')
        .notEmpty().withMessage('State is required'),
    check('city')
        .notEmpty().withMessage('City is required'),
    check('yearsOfExperienceRealEstate')
        .notEmpty().withMessage('Years of experience is required')
        .isInt({ min: 0 }).withMessage('Years of experience must be a non-negative integer'),
    check('courseStartDate')
        .notEmpty().withMessage('Course start date is required')
        .isISO8601().withMessage('Course start date must be a valid date'),
];

exports.list = [
    check('batchId')
        .optional({ nullable: true })
        .isMongoId()
        .withMessage('Batch Id must be a valid MongoDB ObjectId'),
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
        .optional({ nullable: true })
        .isMongoId()
        .withMessage('Batch Id must be a valid MongoDB ObjectId'),

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
        .isIn(['ACTIVE', 'INACTIVE']).withMessage('Invalid status'),

    // enrollmentNo should not be updated through this endpoint
    check('enrollmentNo').not().exists().withMessage('Enrollment number cannot be updated')
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

exports.courseDropdownList = [
    check('search')
        .optional()
        .isString().withMessage('Search must be a string')
        .isLength({ max: 100 }).withMessage('Search must be at most 100 characters long'),
];
