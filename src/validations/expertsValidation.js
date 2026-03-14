const { check, param } = require("express-validator");
const { commonStatus } = require('../config/data.js');

exports.create = [
    check('prefixName').optional().isIn(['MR','MRS','MISS','DR','CA','AR','ADV']).withMessage('Invalid prefix'),
    check('firstName').not().isEmpty().withMessage('First name is required'),
    check('lastName').not().isEmpty().withMessage('Last name is required'),
    check('email').isEmail().withMessage('Valid email is required'),
    check('contactNo').not().isEmpty().withMessage('Contact no is required'),
    check('countryCode').not().isEmpty().withMessage('Country code is required'),
    check('countryCodeName').not().isEmpty().withMessage('Country name is required'),
    check('gender').optional().isIn(['MALE','FEMALE','OTHER']).withMessage('Invalid gender'),
    check('dateOfBirth').not().isEmpty().withMessage('Date of birth is required'),
    check('age').not().isEmpty().withMessage('Age is required').isInt({ min: 0 }).withMessage('Age must be a number'),
    check('state').not().isEmpty().withMessage('State is required'),
    check('city').not().isEmpty().withMessage('City is required'),
    check('highestEducation').not().isEmpty().withMessage('Highest education is required'),
    check('industrialExperience').not().isEmpty().withMessage('Industrial experience is required').isNumeric().withMessage('Industrial experience must be a number'),
    check('specialization').not().isEmpty().withMessage('Specialization is required'),
    check('perHourRate').not().isEmpty().withMessage('Per hour rate is required').isNumeric().withMessage('Per hour rate must be a number'),
];

exports.list = [
    check('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive number'),
    check('pageSize').optional().isInt({ min: 1 }).withMessage('Page size must be a positive number'),
    check('name').optional().trim(),
    check('specialization').optional().trim(),
    check('search').optional().trim(),
    check('status').optional().isIn(commonStatus).withMessage('Invalid status')
];

exports.details = [
    param('id').not().isEmpty().withMessage('Expert id is required').isMongoId().withMessage('Invalid expert id'),
];

exports.delete = [
    param('expertId').not().isEmpty().withMessage('Expert id is required'),
];

exports.update = [
    param('expertId')
        .notEmpty()
        .withMessage('Expert id is required')
        .isMongoId()
        .withMessage('Invalid expert id'),

    // allow updating many of the same fields as create
    check('firstName').optional().notEmpty().withMessage('First name is required'),
    check('lastName').optional().notEmpty().withMessage('Last name is required'),
    check('email').optional().isEmail().withMessage('Valid email is required'),
    check('contactNo').optional().notEmpty().withMessage('Contact no is required'),
    check('dateOfBirth').optional().notEmpty().withMessage('Date of birth is required'),
    check('age').optional().isInt({ min: 0 }).withMessage('Age must be a number'),
    check('state').optional().notEmpty().withMessage('State is required'),
    check('countryCode').optional().notEmpty().withMessage('Country code is required'),
    check('countryCodeName').optional().notEmpty().withMessage('Country name is required'),
    check('city').optional().notEmpty().withMessage('City is required'),
    check('highestEducation').optional().notEmpty().withMessage('Highest education is required'),
    check('industrialExperience').optional().isNumeric().withMessage('Industrial experience must be a number'),
    check('specialization').optional().notEmpty().withMessage('Specialization is required'),
    check('perHourRate').optional().isNumeric().withMessage('Per hour rate must be a number'),
    check('status').optional().notEmpty().withMessage('Status is required')
];