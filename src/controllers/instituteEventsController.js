
const messages = require("../message/index.js");
const response = require("../config/response.js");
const { validationResult } = require('express-validator');
const CommonConfig = require('../config/common.js');
const CommonFun = require('../libs/common.js');
const InstituteEventsModel = require("../models/instituteEvents.js");

/**
 * Create a new event record.
 * @param {Object} req.body.eventName, eventDate, location, description
 * @param {Object} res
 * @returns {Object} created event or error
 *
 * Business logic: validate, build model and save.
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
        const { eventName, eventDate, location, description } = req.body;
        const newEvent = new InstituteEventsModel({
            eventName,
            eventDate,
            location,
            description,
            createdBy: req.userId
        });
        const savedEvent = await newEvent.save();
        return res.status(200).send(response.toJson(messages['en'].common.create_success, savedEvent));
    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

/**
 * List events with filters and pagination.
 * @param {Object} req.query.search,eventDate,location,page,limit
 * @param {Object} res
 * @returns {Object} paged events
 *
 * Business logic: build filter, run find and count in parallel, sort.
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
        const search = req.query.search;
        const eventDate = req.query.eventDate;
        const location = req.query.location;

        // pagination
        const page = parseInt(req.query.page) || 1;
        const pageSize = CommonConfig.instituteCourseListLimit || 10;
        const skip = (page - 1) * pageSize;

        const filter = { isDeleted: false };

        if (search) {
            filter.eventName = { $regex: search, $options: 'i' };
        }

        if (eventDate) {
            filter.eventDate = new Date(eventDate);
        }

        if (location) {
            filter.location = { $regex: location, $options: 'i' };
        }

        const [events, total] = await Promise.all([
            InstituteEventsModel.find(filter)
                .select('_id eventName eventDate location description status')
                .skip(skip)
                .limit(pageSize)
                .sort({ createdAt: -1 }),

            InstituteEventsModel.countDocuments(filter)
        ]);

        return res.status(200).send(
            response.toJson(messages['en'].common.list_success, {
                events,
                total,
                currentPage: page,
                totalPages: total > 0 ? Math.ceil(total / pageSize) : 0
            })
        );

    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

/**
 * Get details for a single event.
 * @param {Object} req.params.eventId
 * @param {Object} res
 * @returns {Object} event document or 404
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
        const { eventId } = req.params;

        const event = await InstituteEventsModel
            .findOne({ _id: eventId, isDeleted: false })
            .select('-isDeleted -deletedAt -__v');

        if (!event) {
            return res.status(404).send(
                response.toJson(messages['en'].instituteEvents.not_found)
            );
        }

        return res.status(200).send(
            response.toJson(messages['en'].common.details_success, event)
        );

    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

/**
 * Update an event by id.
 * @param {Object} req.params.eventId
 * @param {Object} req.body[fields]
 * @param {Object} res
 * @returns {Object} updated event or error
 */
const updateEvent = async (req, res) => {
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
        const { eventId } = req.params;
        const { eventName, eventDate, location, description, status } = req.body;
        const updateData = {
            eventName,
            eventDate,
            location,
            description,
            status,
            updatedBy: req.userId,
            updatedAt: new Date()
        };
        const updatedEvent = await InstituteEventsModel.findByIdAndUpdate(
            eventId,
            updateData,
            { new: true }
        );
        if (!updatedEvent) {
            return res.status(404).send(response.toJson(messages['en'].instituteEvents.not_found));
        }
        return res.status(200).send(response.toJson(messages['en'].common.update_success, updatedEvent));
    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

/**
 * Soft delete an event.
 * @param {Object} req.params.eventId
 * @param {Object} res
 * @returns {Object} success message or 404
 */
const deleteEvent = async (req, res) => {
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
        const { eventId } = req.params;
        const deletedEvent = await InstituteEventsModel.findByIdAndUpdate(
            eventId,
            {
                isDeleted: true,
                deletedAt: new Date(),
                updatedBy: req.userId,
                updatedAt: new Date()
            },
            { new: true }
        );
        if (!deletedEvent) {
            return res.status(404).send(response.toJson(messages['en'].instituteEvents.not_found));
        }
        return res.status(200).send(response.toJson(messages['en'].common.delete_success));
    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

module.exports = {
    create,
    list,
    details,
    updateEvent,
    deleteEvent
};