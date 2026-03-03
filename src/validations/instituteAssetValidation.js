const { check, param } = require("express-validator");

exports.create = [   
    check('assetName')
        .notEmpty().withMessage('Asset name is required')
        .isString().withMessage('Asset name must be a string'),
    check('assetType')
        .notEmpty().withMessage('Asset type is required')
        .isString().withMessage('Asset type must be a string'),
    check('assetNumber')
        .notEmpty().withMessage('Asset number is required')
        .isString().withMessage('Asset number must be a string'),
    check('capacity')
        .optional()
        .isString().withMessage('Capacity must be a string'),
    check('status')
        .optional()
        .isIn(['ACTIVE', 'INACTIVE'])
        .withMessage('Status must be one of ACTIVE & INACTIVE'),
];

exports.list = [ 
    check('assetName')
        .optional()
        .isString().withMessage('Asset name must be a string'),
    check('assetType')
        .optional()
        .isString().withMessage('Asset type must be a string'),
    check('assetNumber')
        .optional()
        .isString().withMessage('Asset number must be a string'),
    check('status')
        .optional()
        .isIn(['ACTIVE', 'INACTIVE'])
        .withMessage('Status must be one of ACTIVE & INACTIVE'),
];

exports.details = [
    param('assetId')
        .notEmpty().withMessage('Asset id is required')
        .isMongoId().withMessage('Asset id must be valid MongoDB ObjectId')
];

exports.update = [
    param('assetId')
        .notEmpty().withMessage('Asset id is required')
        .isMongoId().withMessage('Invalid asset id'),
    check('assetName')
        .optional()
        .notEmpty().withMessage('Asset name is required'),
    check('assetType')
        .optional()
        .notEmpty().withMessage('Asset type is required'),
    check('assetNumber')
        .optional()
        .notEmpty().withMessage('Asset number is required')
        .isString().withMessage('Asset number must be a string'),
    check('capacity')
        .optional()
        .isString().withMessage('Capacity must be a string'),
    check('status')
        .optional()
        .isIn(['ACTIVE', 'INACTIVE'])
        .withMessage('Status must be one of ACTIVE & INACTIVE'),
];

exports.delete = [
    param('assetId').not().isEmpty().withMessage('Asset id is required'),
    param('assetId').isMongoId().withMessage('Invalid asset id')
];