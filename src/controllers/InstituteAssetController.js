const messages = require("../message/index.js");
const response = require("../config/response.js");
const { validationResult } = require('express-validator');
const CommonConfig = require('../config/common.js');
const CommonFun = require('../libs/common.js');
const InstituteAssetModel = require("../models/instituteAsset.js");

/**
 * Create a new institute asset.
 * @param {Object} req Express request; body should contain assetNumber, assetType, assetName, capacity
 * @param {Object} res Express response
 * @returns {Object} JSON response with created asset or validation/error message
 *
 * Business logic:
 *   - Validate input
 *   - (optionally) check user roles
 *   - Build new model instance and save
 *   - Send standardized success or failure response
 */
const create = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(response.toJson(errors.errors[0].msg));
    }
    try {
        // Role validation
        // const allowedRoles = ["SuperAdmin", "InstituteManager", "InstituteExecutive"];
        // const userHasAccess = req.user?.userRoles?.some(role =>
        //     allowedRoles.includes(role)
        // );

        // if (!userHasAccess) {
        //     return res.status(404).send(
        //         response.toJson(messages['en'].auth.not_access)
        //     );
        // }
        const { assetNumber, assetType, assetName, capacity } = req.body;
        const newAsset = new InstituteAssetModel({
            assetNumber,
            assetType,
            assetName,
            capacity,
            createdBy: req.userId
        });
        const savedAsset = await newAsset.save();
        return res.status(200).send(response.toJson(messages['en'].common.create_success, savedAsset));
    }
    catch (error) {
        console.error("Error creating asset:", error);
        return res.status(500).send(response.toJson(messages['en'].instituteAsset.not_exists));
    }
};

/**
 * List assets with pagination and optional search filter.
 * @param {Object} req Query params: search,page,limit,sortBy,sortOrder
 * @param {Object} res
 * @returns {Object} paginated asset list
 *
 * Business logic:
 *   - Validate request
 *   - Build mongo filter and sort object
 *   - Execute find + countDocuments in parallel
 *   - Map results to simplified DTO
 */
const list = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(response.toJson(errors.errors[0].msg));
    }
    try {
        // Role validation
        // const allowedRoles = ["SuperAdmin", "InstituteManager", "InstituteExecutive"];
        // const userHasAccess = req.user?.userRoles?.some(role =>
        //     allowedRoles.includes(role)
        // );

        // if (!userHasAccess) {
        //     return res.status(404).send(
        //         response.toJson(messages['en'].auth.not_access)
        //     );
        // }
        const {
            search,
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            sortOrder = "desc"
        } = req.query;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        const filter = { isDeleted: false };

        if (search) {
            filter.$or = [
                { assetNumber: { $regex: search, $options: "i" } },
                { assetType: { $regex: search, $options: "i" } },
                { assetName: { $regex: search, $options: "i" } }
            ];
        }

        const sort = {
            [sortBy]: sortOrder === "asc" ? 1 : -1
        };
        const [assets, total] = await Promise.all([
            InstituteAssetModel
                .find(filter)
                .select("_id assetNumber assetType assetName capacity")
                .sort(sort)
                .skip(skip)
                .limit(limitNumber),

            InstituteAssetModel.countDocuments(filter)
        ]);
        const formattedAssets = assets.map(asset => ({
            id: asset._id,
            number: asset.assetNumber,
            type: asset.assetType,
            name: asset.assetName,
            capacity: asset.capacity
        }));

        return res.status(200).send(
            response.toJson(messages['en'].common.list_success,
                {
                    totalRecords: total,
                    currentPage: pageNumber,
                    totalPages: Math.ceil(total / limitNumber),
                    assets: formattedAssets
                }
            )
        );

    } catch (error) {
        const statusCode = error.statusCode || 500;
        const errMess = error.message || error;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

/**
 * Fetch asset detail by id.
 * @param {Object} req.params.assetId
 * @param {Object} res
 * @returns {Object} asset document or 404
 *
 * Business logic: query active asset and return selected fields.
 */
const details = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(response.toJson(errors.errors[0].msg));
    }
    try {
        // Role validation
        // const allowedRoles = ["SuperAdmin", "InstituteManager", "InstituteExecutive"];
        // const userHasAccess = req.user?.userRoles?.some(role =>
        //     allowedRoles.includes(role)
        // );

        // if (!userHasAccess) {
        //     return res.status(404).send(
        //         response.toJson(messages['en'].auth.not_access)
        //     );
        // }  
        const { assetId } = req.params;

        const asset = await InstituteAssetModel.findOne({
            _id: assetId,
            isDeleted: false
        }).select("_id assetNumber assetType assetName capacity status createdAt updatedAt");

        if (!asset) {
            return res.status(404).send(
                response.toJson(messages['en'].instituteAsset.not_exists)
            );
        }

        return res.status(200).send(
            response.toJson(
                messages['en'].common.detail_success,
                asset
            )
        );

    } catch (error) {
        return res.status(500).send(
            response.toJson("Internal server error")
        );
    }
};

/**
 * Update an existing asset.
 * @param {Object} req.params.assetId
 * @param {Object} req.body fields to update
 * @param {Object} res
 * @returns {Object} updated asset or 404
 *
 * Business logic: apply changes with audit fields via findByIdAndUpdate.
 */
const updateAsset = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(response.toJson(errors.errors[0].msg));
    }
    try {
        // Role validation
        // const allowedRoles = ["SuperAdmin", "InstituteManager", "InstituteExecutive"];
        // const userHasAccess = req.user?.userRoles?.some(role =>
        //     allowedRoles.includes(role)
        // );

        // if (!userHasAccess) {
        //     return res.status(404).send(
        //         response.toJson(messages['en'].auth.not_access)
        //     );
        // }
        const { assetId } = req.params;

        const updateData = {
            ...req.body,
            updatedBy: req.userId,
            updatedAt: new Date()
        };

        const updatedAsset = await InstituteAssetModel.findByIdAndUpdate(
            assetId,
            updateData,
            { new: true }
        );

        if (!updatedAsset) {
            return res.status(404).send(
                response.toJson(messages['en'].instituteAsset.not_found)
            );
        }

        return res.status(200).send(
            response.toJson(messages['en'].common.update_success, updatedAsset)
        );

    } catch (error) {
        console.error("Error updating asset:", error);
        return res.status(500).send(
            response.toJson(messages['en'].common.something_wrong)
        );
    }
};

/**
 * Soft-delete an asset by id.
 * @param {Object} req.params.assetId
 * @param {Object} res
 * @returns {Object} success message or 404
 *
 * Business logic: set isDeleted flag and record deletedAt.
 */
const deleteAsset = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(response.toJson(errors.errors[0].msg));
    }
    try {

        // Role validation
        // const allowedRoles = ["SuperAdmin", "InstituteManager", "InstituteExecutive"];
        // const userHasAccess = req.user?.userRoles?.some(role =>
        //     allowedRoles.includes(role)
        // );

        // if (!userHasAccess) {
        //     return res.status(404).send(
        //         response.toJson(messages['en'].auth.not_access)
        //     );
        // }
        const { assetId } = req.params;
        const deletedAsset = await InstituteAssetModel.findByIdAndUpdate

            (assetId,
                {
                    isDeleted: true,
                    deletedAt: new Date(),
                    updatedBy: req.userId,
                    updatedAt: new Date()
                },
                { new: true }
            );
        if (!deletedAsset) {
            return res.status(404).send(response.toJson(messages['en'].instituteAsset.not_found));
        }
        return res.status(200).send(response.toJson(messages['en'].common.delete_success));
    }
    catch (error) {
        console.error("Error deleting asset:", error);
        return res.status(500).send(response.toJson(messages['en'].common.not_exists));
    }
};

module.exports = {
    create,
    list,
    details,
    updateAsset,
    deleteAsset
}