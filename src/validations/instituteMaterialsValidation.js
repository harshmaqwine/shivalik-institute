const { check, param } = require("express-validator");

exports.getModulesList = [ 
    check('search')
            .optional()
            .isString().withMessage('Search must be a string')
            .isLength({ max: 100 }).withMessage('Search must be at most 100 characters long'),
    check('status')
        .optional()
        .isIn(['ACTIVE', 'INACTIVE']).withMessage('Status must be either ACTIVE or INACTIVE'), 
];