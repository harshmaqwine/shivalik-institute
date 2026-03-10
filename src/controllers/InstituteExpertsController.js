const messages = require("../message/index.js");
const response = require("../config/response.js");
const { validationResult } = require('express-validator');
const CommonConfig = require('../config/common.js'); 
const { commonStatus } = require('../config/data');
const expertsModel = require("../models/instituteExperts.js");


/**
 * Creates a new expert profile.
 *
 * @param {import('express').Request} req Express request containing `name`, `specialization`, and `perHourRate` in body.
 * @param {import('express').Response} res Express response.
 * @returns {Promise<void>} Sends success response with created expert or validation/server error response.
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
        // copy body fields directly; mongoose will apply schema rules
        const expertData = {
            ...req.body,
            createdBy: req.userId
        };
        // bankDetails may be sent as JSON string
        if (expertData.bankDetails && typeof expertData.bankDetails === 'string') {
            try { expertData.bankDetails = JSON.parse(expertData.bankDetails); } catch(e) { /* ignore parse errors */ }
        }

        // panCard and profilePicture URLs should be sent from the frontend
        if (req.body.panCard) {
            expertData.panCard = req.body.panCard;
        }
        if (req.body.profilePicture) {
            expertData.profilePicture = req.body.profilePicture;
        }

        const newExpert = new expertsModel.Experts(expertData);
        const savedExpert = await newExpert.save();
        return res.status(200).send(response.toJson(messages['en'].experts.create_success, savedExpert));
    }
    catch (error) {
        console.error("Error creating expert:", error);
        return res.status(500).send(response.toJson(messages['en'].experts.create_failure));
    }
}

/**
 * Returns paginated experts list with optional status and text-search filters.
 *
 * @param {import('express').Request} req Express request with query params: `page`, `pageSize`, `sortBy`, `sortOrder`, `status`, `search`, `name`, `specialization`.
 * @param {import('express').Response} res Express response.
 * @returns {Promise<void>} Sends paginated expert list response.
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

          // Pagination
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const skip = (page - 1) * pageSize;

        // Sorting
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const sort = { [sortBy]: sortOrder };

        // Base filter
        const filters = { isDeleted: false };

        // 🔎 Search (firstName + lastName + specialization)
        if (req.query.search) {
            filters.$or = [
                { firstName: { $regex: req.query.search, $options: 'i' } },
                { lastName: { $regex: req.query.search, $options: 'i' } },
                { specialization: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Individual Filters
        if (req.query.name) {
            filters.$or = [
                { firstName: { $regex: req.query.name, $options: 'i' } },
                { lastName: { $regex: req.query.name, $options: 'i' } }
            ];
        }

        if (req.query.specialization) {
            filters.specialization = {
                $regex: req.query.specialization,
                $options: 'i'
            };
        }

        if (req.query.status) {
            filters.status = req.query.status;
        }

        // Fetch Data
        const [experts, totalRecords] = await Promise.all([
            expertsModel.Experts.find(filters)
                .select("-createdAt -updatedAt -__v")
                .sort(sort)
                .skip(skip)
                .limit(pageSize)
                .lean(),

            expertsModel.Experts.countDocuments(filters)
        ]);

        return res.status(200).send(
            response.toJson(messages['en'].experts.list_success, {
                experts,
                pagination: {
                    totalRecords,
                    currentPage: page,
                    totalPages: totalRecords > 0 ? Math.ceil(totalRecords / pageSize) : 0,
                    pageSize
                }
            })
        );

    } catch (error) {
        console.error("Error fetching experts:", error);
        return res.status(500).send(
            response.toJson(messages['en'].experts.list_failure)
        );
    }
};

/**
 * Returns details of one expert by id.
 *
 * @param {import('express').Request} req Express request with route param `id`.
 * @param {import('express').Response} res Express response.
 * @returns {Promise<void>} Sends expert details or not-found response.
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
        const { id } = req.params;
        const expert = await expertsModel.Experts.findOne({
            _id: id, isDeleted: false
        }).select("-__v").lean();
        if (!expert) {
            return res.status(404).send(response.toJson(messages['en'].experts.not_found));
        }
        return res.status(200).send(response.toJson(messages['en'].experts.details_success, expert));
    } catch (error) {
        console.error("Error fetching expert details:", error);
        return res.status(500).send(response.toJson(messages['en'].experts.details_failure));
    }
};

/**
 * Updates an existing expert record.
 *
 * @param {import('express').Request} req Express request with route param `expertId` and updatable fields in body.
 * @param {import('express').Response} res Express response.
 * @returns {Promise<void>} Sends updated expert payload or error response.
 */
const update = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(
            response.toJson(errors.array()[0].msg)
        );
    }

    try {
        // const allowedRoles = ["SuperAdmin", "InstituteManager", "InstituteExecutive"];
        // const userHasAccess = req.user?.userRoles?.some(role =>
        //     allowedRoles.includes(role)
        // );

        // if (!userHasAccess) {
        //     return res.status(403).send(
        //         response.toJson(messages['en'].auth.not_access)
        //     );
        // }

        const { expertId } = req.params;

        const updateData = {
            ...req.body,
            // updatedBy: req.user?._id,
            updatedAt: new Date()
        };
        if (updateData.bankDetails && typeof updateData.bankDetails === 'string') {
            try { updateData.bankDetails = JSON.parse(updateData.bankDetails); } catch(e) { }
        }
        // frontend must supply any new panCard/profilePicture URLs
        if (req.body.panCard) {
            updateData.panCard = req.body.panCard;
        }
        if (req.body.profilePicture) {
            updateData.profilePicture = req.body.profilePicture;
        }

        const updatedExpert = await expertsModel.Experts.findByIdAndUpdate(
            expertId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-__v -createdAt -updatedAt");

        if (!updatedExpert) {
            return res.status(404).send(
                response.toJson(messages['en'].experts.not_found)
            );
        }

        return res.status(200).send(
            response.toJson(messages['en'].experts.update_success, updatedExpert)
        );

    } catch (error) {
        console.error("Error updating expert:", error);
        return res.status(500).send(
            response.toJson(messages['en'].experts.update_failure)
        );
    }
};

// Soft delete implementation
/**
 * Soft deletes an expert by setting `isDeleted=true`.
 *
 * @param {import('express').Request} req Express request with route param `expertId`.
 * @param {import('express').Response} res Express response.
 * @returns {Promise<void>} Sends delete success or not-found response.
 */
const deleteExpert = async (req, res) => {
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
        const { expertId } = req.params;
        const deletedExpert = await expertsModel.Experts.findByIdAndUpdate(
            expertId,
            { isDeleted: true },
            { new: true }
        );
        if (!deletedExpert) {
            return res.status(404).send(response.toJson(messages['en'].experts.not_found));
        }
        return res.status(200).send(response.toJson(messages['en'].experts.delete_success));
    } catch (error) {
        console.error("Error deleting expert:", error);
        return res.status(500).send(response.toJson(messages['en'].experts.delete_failure));
    }
}

module.exports = {
    create,
    list,
    details,
    update,
    deleteExpert
}