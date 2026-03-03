
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
    }
    catch (error) {
        console.error("Error creating event:", error);
        return res.status(500).send(response.toJson(messages['en'].instituteEvents.create_failure));
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
        const {
            search,
            eventDate,
            location,
            page = 1,
            limit = 10
        } = req.query;

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

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        const [events, total] = await Promise.all([
            InstituteEventsModel.find(filter)
                .select('_id eventName eventDate location description status')
                .skip(skip)
                .limit(limitNumber)
                .sort({ createdAt: -1 }),

            InstituteEventsModel.countDocuments(filter)
        ]);

        return res.status(200).send(
            response.toJson(messages['en'].common.list_success, {
                events,
                total,
                page: pageNumber,
                limit: limitNumber
            })
        );

    } catch (error) {
        console.error("Error listing events:", error);
        return res.status(500).send(
            response.toJson(messages['en'].instituteEvents.list_failure)
        );
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

    } catch (error) {
        console.error("Error fetching event details:", error);
        return res.status(500).send(
            response.toJson(messages['en'].common.not_exists)
        );
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
    }
    catch (error) {
        console.error("Error updating event:", error);
        return res.status(500).send(response.toJson(messages['en'].instituteEvents.update_failure));
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
    }
    catch (error) {
        console.error("Error deleting event:", error);
        return res.status(500).send(response.toJson(messages['en'].instituteEvents.delete_failure));
    }
};

module.exports = {
    create,
    list,
    details,
    updateEvent,
    deleteEvent
};