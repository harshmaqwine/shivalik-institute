const messages = require("../message/index.js");
const response = require("../config/response.js");
const { validationResult } = require('express-validator');
const CommonConfig = require('../config/common.js');
const CommonFun = require('../libs/common.js');
const InstituteCoursesModel = require('../models/instituteCourses.js');
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

        const {
            CourseId,
            batchId,
            prefixName,
            firstName,
            lastName,
            email,
            phone,
            alternatePhone,
            enrollmentNo: providedEnrollment,
            gender,
            dateOfBirth,
            age,
            state,
            city,
            highestEducation,
            currentDesignation,
            yearsOfExperienceRealEstate,
            courseStartDate,
            holdingSeat,
            enrolledCourse,
            documentsSubmitted,
            profilePicture: bodyProfilePicture,
            isCoordinator,
            status
        } = req.body;

        let enrollmentNo = providedEnrollment;
        
        // generate enrollment number
        if (!enrollmentNo) {
            // find last numeric suffix
            const last = await InstituteStudentsModel.findOne({
                enrollmentNo: { $regex: /^SIRE\d{5}$/ }
            })
                .sort({ enrollmentNo: -1 })
                .select('enrollmentNo')
                .lean();

            let nextNum = 1;
            if (last && last.enrollmentNo) {
                const num = parseInt(last.enrollmentNo.slice(4), 10);
                if (!isNaN(num)) nextNum = num + 1;
            }
            enrollmentNo = `SIRE${String(nextNum).padStart(5, '0')}`;
        }
        let profilePicture = bodyProfilePicture;

        // Verify batch exists
        if (batchId) {
            const batch = await InstituteBatchesModel.findOne({ _id: batchId, isDeleted: false });

            if (!batch) {
                return res.status(404).send(
                    response.toJson(messages['en'].instituteStudent.batch_not_exist)
                );
            }
        }

        // if course id is supplied, make sure the course exists
        if (CourseId) {
            const course = await InstituteCoursesModel.findOne({ _id: CourseId, isDeleted: false });
            if (!course) {
                return res.status(404).send(response.toJson(messages['en'].common.not_exists));
            }
        }

        // deduplicate within the same batch by email/phone; enrollment number remains global
        let existingStudent = null;
        if (email || phone || enrollmentNo) {
            const orClause = [];
            if (email) orClause.push({ email, batchId });
            if (phone) orClause.push({ phone, batchId });
            if (enrollmentNo) orClause.push({ enrollmentNo, batchId });
            existingStudent = await InstituteStudentsModel.findOne({ $or: orClause });
        }

        if (existingStudent) {
            if (!existingStudent.isDeleted) {
                // active student already exists 
                if (email && existingStudent.email === email) {
                    return res.status(400).send(response.toJson(messages['en'].instituteStudent.email_exists));
                }
                if (enrollmentNo && existingStudent.enrollmentNo === enrollmentNo) {
                    return res.status(400).send(response.toJson(messages['en'].instituteStudent.enrollment_no_exists));
                }
                return res.status(400).send(response.toJson(messages['en'].instituteStudent.email_exists));
            }
            await InstituteStudentsModel.deleteOne({ _id: existingStudent._id });
        }

        const normPrefix = typeof prefixName === 'string' ? prefixName.toUpperCase() : prefixName;
        const normGender = typeof gender === 'string' ? gender.toUpperCase() : gender;

        const studentDocs = req.body.documentsSubmitted || {};
        if (bodyProfilePicture) {
            profilePicture = bodyProfilePicture;
        }

        // Assemble student document
        const newStudent = new InstituteStudentsModel({
            CourseId,
            batchId,
            prefixName: normPrefix,
            firstName,
            lastName,
            email,
            phone,
            alternatePhone,
            enrollmentNo,
            gender: normGender,
            dateOfBirth,
            age,
            state,
            city,
            highestEducation,
            currentDesignation,
            yearsOfExperienceRealEstate,
            courseStartDate,
            holdingSeat,
            enrolledCourse,
            documentsSubmitted: studentDocs,
            profilePicture,
            isCoordinator,
            status,
            enrolledBy: req.user?._id
        });
        await newStudent.save();

        return res.status(201).send(response.toJson(messages['en'].instituteStudent.create_success, newStudent));

    } catch (error) {
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

        let {
            batchId,
            status,
            name,
            email,
            phone,
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            sortOrder = "desc",
            search
        } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        const filter = { isDeleted: false };

        if (batchId) filter.batchId = batchId;
        if (status) filter.status = status;

        if (name) {
            filter.$or = [
                { firstName: { $regex: name, $options: "i" } },
                { lastName: { $regex: name, $options: "i" } }
            ];
        }

        if (email) filter.email = { $regex: email, $options: "i" };
        if (phone) filter.phone = { $regex: phone, $options: "i" };

        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
                { enrollmentNo: { $regex: search, $options: "i" } }
            ];
        }

        const sort = {};
        sort[sortBy] = sortOrder === "asc" ? 1 : -1;

        const total = await InstituteStudentsModel.countDocuments(filter);

        const students = await InstituteStudentsModel
            .find(filter)
            .select("enrollmentNo firstName lastName email phone batchId CourseId status")
            .populate({
                path: "batchId",
                select: "batchName"
            })
            .populate({
                path: "CourseId",
                select: "name"
            })
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit);

        const formattedStudents = students.map(student => ({
            _id: student._id,
            enrollmentNo: student.enrollmentNo,
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            phone: student.phone,
            batch: student.batchId
                ? { _id: student.batchId._id, name: student.batchId.batchName }
                : null,
            course: student.CourseId
                ? { _id: student.CourseId._id, name: student.CourseId.name }
                : null,
            status: student.status
        }));

        return res.status(200).json({
            success: true,
            data: formattedStudents,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error("List Students Error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
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
            .populate({
                path: "batchId",
                select: "batchName"
            })
            .populate({
                path: "CourseId",
                select: "name"
            });

        if (!student) {
            return res.status(404).send(
                response.toJson(messages['en'].instituteStudent.not_exists)
            );
        }

        const formattedStudent = {
            _id: student._id,
            prefixName: student.prefixName,
            firstName: student.firstName,
            lastName: student.lastName,
            enrollmentNo: student.enrollmentNo,
            email: student.email,
            phone: student.phone,
            alternatePhone: student.alternatePhone,
            gender: student.gender,
            dateOfBirth: student.dateOfBirth,
            age: student.age,
            state: student.state,
            city: student.city,
            highestEducation: student.highestEducation,
            currentDesignation: student.currentDesignation,
            yearsOfExperienceRealEstate: student.yearsOfExperienceRealEstate,
            courseStartDate: student.courseStartDate,

            documentsSubmitted: student.documentsSubmitted,
            profilePicture: student.profilePicture,

            holdingSeat: student.holdingSeat,
            enrolledCourse: student.enrolledCourse,
            isCoordinator: student.isCoordinator,

            status: student.status,

            course: student.CourseId ? {
                _id: student.CourseId._id,
                name: student.CourseId.name
            } : null,

            batch: student.batchId ? {
                _id: student.batchId._id,
                name: student.batchId.batchName,
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
            status,
            enrollmentNo: attemptEnroll 
        } = req.body;
 
        if (attemptEnroll) {
            return res.status(400).send(
                response.toJson(messages['en'].instituteStudent.enrollment_no_update)
            );
        }

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
                batchId: student.batchId,
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

        if (phone && phone !== student.phone) {
            const phoneExists = await InstituteStudentsModel.findOne({
                phone,
                batchId: student.batchId,
                _id: { $ne: studentId },
                isDeleted: false
            });
            if (phoneExists) {
                return res.status(400).send(
                    response.toJson(messages['en'].instituteStudent.phone_exists)
                );
            }
            student.phone = phone;
        }
        if (name) student.name = name;
        if (status) student.status = status;

        if (req.body.documentsSubmitted) {
            student.documentsSubmitted = req.body.documentsSubmitted;
        }
        if (req.body.profilePicture) {
            student.profilePicture = req.body.profilePicture;
        }

        student.updatedAt = new Date();

        await student.save();

        return res.status(200).send(
            response.toJson(
                messages['en'].common.update_success,
                //     {
                //         id: student._id,
                //         name: student.name,
                //         email: student.email,
                //         phone: student.phone,
                //         status: student.status,
                //         updatedBy: student.updatedBy,
                //         updatedAt: student.updatedAt
                //     }
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
        const filters = { isDeleted: false };

        if (req.query.status) {
            req.query.status = String(req.query.status).toUpperCase();
        }

        if (req.query.search) {
            filters.name = {
                $regex: req.query.search,
                $options: "i"
            };
        }
        const baseQuery = { isDeleted: false };
        if (req.query.instituteCourseId) {
            baseQuery.instituteCourseId = req.query.instituteCourseId;
        }
        if (req.query.instituteSubCourseId) {
            baseQuery.instituteSubCourseId = req.query.instituteSubCourseId;
        }
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

// get global course _id & name list for dropdown 
const courseDropdownList = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(
            response.toJson(errors.errors[0].msg)
        );
    }

    try {
        // const allowedRoles = ["SuperAdmin", "InstituteManager", "InstituteExecutive"];
        // const userHasAccess = req.user?.userRoles?.some(role =>
        //     allowedRoles.includes(role)
        // );

        // if (!userHasAccess) {
        //     return res.status(404).send(
        //         response.toJson(messages['en'].auth.not_access)
        //     );
        // }
        const courses = await InstituteCoursesModel.find(
            {
                isDeleted: false,
                status: 'ACTIVE'
            }
        )
            .select('_id name')
            .lean();

        return res.status(200).send(
            response.toJson(
                messages['en'].common.list_success,
                { courses }
            )
        );

    } catch (err) {
        console.log(err);
        return res.status(500).send(
            response.toJson(err.message || err)
        );
    }
};

module.exports = {
    createStudent,
    listStudents,
    detailStudent,
    updateStudent,
    batchDropdownList,
    deleteStudent,
    courseDropdownList
};