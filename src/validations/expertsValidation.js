const { check, param } = require("express-validator");

exports.create = [
    check('name').not().isEmpty().withMessage('Name is required'),
    check('specialization').not().isEmpty().withMessage('Specialization is required'),
    check('perHourRate').not().isEmpty().withMessage('Per hour rate is required').isNumeric().withMessage('Per hour rate must be a number'),
];

exports.list = [
    check('name').optional().not().isEmpty().withMessage('Name is required'),
    check('specialization').optional().not().isEmpty().withMessage('Specialization is required'),
    check('perHourRate').optional().not().isEmpty().withMessage('Per hour rate is required').isNumeric().withMessage('Per hour rate must be a number'),
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

    check('name')
        .optional()
        .notEmpty()
        .withMessage('Name is required'),

    check('specialization')
        .optional()
        .notEmpty()
        .withMessage('Specialization is required'),

    check('perHourRate')
        .optional()
        .notEmpty()
        .withMessage('Per hour rate is required')
        .isNumeric()
        .withMessage('Per hour rate must be a number'),

    check('status')
        .optional()
        .notEmpty()
        .withMessage('Status is required')
];