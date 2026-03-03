const messages = require("../message/index.js");
const response = require("../config/response.js");
const { validationResult } = require('express-validator');
const CommonConfig = require('../config/common.js');
const CommonFun = require('../libs/common.js');
const InstituteBatchesModel = require("../models/instituteBatches.js");
const InstituteStudentsModel = require("../models/instituteStudents.js");

/**
 * Create a new student and assign to a batch.
 * @param {Object} req.body.batchId,name,email,phone
 * @param {Object} res
 * @returns {Object} created student or error message
 */
const createStudent = async (req, res) => {
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

        const { batchId, name, email, phone } = req.body;

        // Check if batch exists
        const batch = await InstituteBatchesModel.findOne({ _id: batchId, isDeleted: false });
        if (!batch) {
            return res.status(404).send(response.toJson(messages['en'].instituteStudent.batch_not_exist));
        }

        // look for any student with this email
        const existingStudent = await InstituteStudentsModel.findOne({ email: email });
        if (existingStudent) {
            if (!existingStudent.isDeleted) {
                // active student already exists
                return res.status(400).send(response.toJson(messages['en'].instituteStudent.email_exists));
            }
            // record exists but previously soft-deleted; remove it so we can create a fresh document
            await InstituteStudentsModel.deleteOne({ _id: existingStudent._id });
        }

        // Create new student
        const newStudent = new InstituteStudentsModel({
            batchId,
            name,
            email,
            phone,
            // createdBy: req.user._id
        });
        await newStudent.save();

        return res.status(201).send(response.toJson(messages['en'].instituteStudent.create_success, newStudent));

    } catch (error) {
        // intercept duplicate email error from MongoDB
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            return res.status(400).send(
                response.toJson(messages['en'].instituteStudent.email_exists)
            );
        }
        const statusCode = error.statusCode || 500;
        const errMess = error.message || error;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

/**
 * Retrieve list of students with filters/pagination.
 * @param {Object} req.query.batchId,status,name,email,phone,search,page,limit,sortBy,sortOrder
 * @param {Object} res
 * @returns {Object} paged students with totals
 */
const listStudents = async (req, res) => {
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
        //     return res.status(403).send(
        //         response.toJson(messages['en'].auth.not_access)
        //     );
        // }

        const {
            batchId,
            status,
            name,
            email,
            phone,
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

        if (batchId) filter.batchId = batchId;
        if (status) filter.status = status;
        if (name) filter.name = { $regex: name, $options: "i" };
        if (email) filter.email = { $regex: email, $options: "i" };
        if (phone) filter.phone = { $regex: phone, $options: "i" };

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } }
            ];
        }

        const sort = {
            [sortBy]: sortOrder === "asc" ? 1 : -1
        };

        const [students, total] = await Promise.all([
            InstituteStudentsModel
                .find(filter)
                .select("_id name email phone status batchId")
                .populate({
                    path: "batchId",
                    select: "batchName"
                })
                .sort(sort)
                .skip(skip)
                .limit(limitNumber),

            InstituteStudentsModel.countDocuments(filter)
        ]);

        const formattedStudents = students.map(student => ({
            id: student._id,
            name: student.name,
            email: student.email,
            phone: student.phone,
            batch: student.batchId?.batchName || "",
            status: student.status
        }));

        return res.status(200).send(
            response.toJson(
                messages['en'].common.list_success,
                {
                    totalRecords: total,
                    currentPage: pageNumber,
                    totalPages: Math.ceil(total / limitNumber),
                    students: formattedStudents
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
 * Get detailed information for one student.
 * @param {Object} req.params.studentId
 * @param {Object} res
 * @returns {Object} student details or 404
 */
const detailStudent = async (req, res) => {
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
        //     return res.status(403).send(
        //         response.toJson(messages['en'].auth.not_access)
        //     );
        // }

        const { studentId } = req.params;

        const student = await InstituteStudentsModel
            .findOne({
                _id: studentId,
                isDeleted: false
            })
            .select("name email phone status batchId createdAt updatedAt")
            .populate({
                path: "batchId",
                select: "batchName startDate endDate shift status"
            });

        if (!student) {
            return res.status(404).send(
                response.toJson(messages['en'].instituteStudent.not_exists)
            );
        }

        // Format response
        const formattedStudent = {
            id: student._id,
            name: student.name,
            email: student.email,
            phone: student.phone,
            status: student.status,
            batch: student.batchId ? {
                id: student.batchId._id,
                batchName: student.batchId.batchName,
                shift: student.batchId.shift,
                startDate: student.batchId.startDate,
                endDate: student.batchId.endDate,
                status: student.batchId.status
            } : null,
            createdAt: student.createdAt,
            updatedAt: student.updatedAt
        };

        return res.status(200).send(
            response.toJson(
                messages['en'].common.list_success,
                formattedStudent
            )
        );

    } catch (error) {
        const statusCode = error.statusCode || 500;
        const errMess = error.message || error;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

/**
 * Update student data or change batch.
 * @param {Object} req.params.studentId
 * @param {Object} req.body fields to modify
 * @param {Object} res
 * @returns {Object} updated summary or error
 */
const updateStudent = async (req, res) => {
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
        //     return res.status(403).send(
        //         response.toJson(messages['en'].auth.not_access)
        //     );
        // }

        const { studentId } = req.params;
        const {
            batchId,
            name,
            email,
            phone,
            status
        } = req.body;

        const student = await InstituteStudentsModel.findOne({
            _id: studentId,
            isDeleted: false
        });

        if (!student) {
            return res.status(404).send(
                response.toJson(messages['en'].instituteStudent.not_exists)
            );
        }

        if (batchId) {
            const batchExists = await InstituteBatchesModel.findOne({
                _id: batchId,
                isDeleted: false
            });

            if (!batchExists) {
                return res.status(404).send(
                    response.toJson(messages['en'].instituteBatch.not_exists)
                );
            }

            student.batchId = batchId;
        }

        if (email && email !== student.email) {
            const emailExists = await InstituteStudentsModel.findOne({
                email,
                _id: { $ne: studentId },
                isDeleted: false
            });

            if (emailExists) {
                return res.status(400).send(
                    response.toJson(messages['en'].instituteStudent.email_exists)
                );
            }

            student.email = email;
        }

        if (name) student.name = name;
        if (phone) student.phone = phone;
        if (status) student.status = status;

        student.updatedAt = new Date();

        await student.save();

        return res.status(200).send(
            response.toJson(
                messages['en'].common.update_success,
                {
                    id: student._id,
                    name: student.name,
                    email: student.email,
                    phone: student.phone,
                    status: student.status,
                    updatedBy: student.updatedBy,
                    updatedAt: student.updatedAt
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
 * Soft delete a student record.
 * @param {Object} req.params.studentId
 * @param {Object} res
 * @returns {Object} deletion confirmation or error
 */
const deleteStudent = async (req, res) => {
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
        //     return res.status(403).send(
        //         response.toJson(messages['en'].auth.not_access)
        //     );
        // }

        const { studentId } = req.params;

        const student = await InstituteStudentsModel.findOne({
            _id: studentId,
            isDeleted: false
        });

        if (!student) {
            return res.status(404).send(
                response.toJson(messages['en'].instituteStudent.not_exists)
            );
        }

        student.isDeleted = true;
        student.deletedAt = new Date();
        await student.save();

        return res.status(200).send(
            response.toJson(
                messages['en'].common.delete_success,
                {
                    id: student._id,
                    deletedAt: student.deletedAt
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
 * Return active batches for dropdowns (used by student UI).
 * @param {Object} req.query.status,search
 * @param {Object} res
 * @returns {Object} array of batches
 */
const batchDropdownList = async (req, res) => {
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
        const filters = { isDeleted: false, status: "ACTIVE" };

        if (req.query.status) {
            req.query.status = String(req.query.status).toUpperCase();
        }

        if (req.query.search) {
            filters.name = {
                $regex: req.query.search,
                $options: "i"
            };
        }
        const baseQuery = { ...filters }; 
        const batches = await InstituteBatchesModel.find(baseQuery, { _id: 1, batchName: 1 }).lean();
        return res.status(200).send(response.toJson(messages['en'].common.list_success, { batches }));
    }
    catch (err) {
        console.log(err);
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

module.exports = {
    createStudent,
    listStudents,
    detailStudent,
    updateStudent,
    batchDropdownList,
    deleteStudent
};