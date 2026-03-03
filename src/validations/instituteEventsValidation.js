
const { check, param } = require("express-validator");

exports.create = [  
    check('eventName').not().isEmpty().withMessage('Event name is required'),
    check('eventDate').not().isEmpty().withMessage('Event date is required').isISO8601().withMessage('Event date must be a valid date'),
    check('description').optional().isString().withMessage('Description must be a string'),
];

exports.list = [
    check('search').optional().isString().withMessage('Search must be a string'),
    check('eventDate').optional().isISO8601().withMessage('Event date must be a valid date'),
];

exports.details = [
    param('eventId')
        .notEmpty().withMessage('Event id is required')
        .isMongoId().withMessage('Event id must be valid MongoDB ObjectId')
];

exports.update = [
    param('eventId')
        .notEmpty().withMessage('Event id is required')
        .isMongoId().withMessage('Invalid event id'),
    check('eventName')
        .optional()
        .notEmpty().withMessage('Event name is required'),
    check('eventDate')
        .optional()
        .notEmpty().withMessage('Event date is required')
        .isISO8601().withMessage('Event date must be a valid date'),
    check('description')
        .optional()
        .isString().withMessage('Description must be a string'),
    check('status')
        .optional()
        .isIn(['ACTIVE', 'INACTIVE'])
        .withMessage('Status must be one of ACTIVE & INACTIVE'),
];

exports.delete = [
    param('eventId').not().isEmpty().withMessage('Event id is required'),
];