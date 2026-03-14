const messages = require("../message/index.js");
const response = require("../config/response.js");
const { validationResult } = require('express-validator');
const CommonConfig = require('../config/common.js');
const CommonFun = require('../libs/common.js');
const InstituteCoursesModel = require('../models/instituteCourses.js');
const InstituteBatchesModel = require("../models/instituteBatches.js");
const InstituteSubCoursesModel = require("../models/instituteSubCourses.js");
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
            subCourseId,
            batchId,
            prefixName,
            firstName,
            lastName,
            email,
            countryCode,
            countryCodeName,
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

        // if subCourse id is supplied, make sure the sub-course exists
        if (subCourseId) {
            const subCourse = await InstituteSubCoursesModel.findOne({ _id: subCourseId, isDeleted: false });
            if (!subCourse) {
                return res.status(404).send(response.toJson(messages['en'].instituteCourse.subcourse_invalid));
            }
        }



        // deduplicate within the same batch/course/subcourse by email/phone; enrollment number remains global
        let existingStudent = null;
        if (email || phone || enrollmentNo) {
            const orClause = [];
            const base = { batchId, CourseId, subCourseId };
            if (email) orClause.push({ ...base, email });
            if (phone) orClause.push({ ...base, phone });
            if (enrollmentNo) orClause.push({ ...base, enrollmentNo });
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
            subCourseId,
            batchId,
            prefixName: normPrefix,
            firstName,
            lastName,
            email,
            countryCode,
            countryCodeName,
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
            enrolledBy: req.user?._id,
        });
        await newStudent.save();

        return res.status(201).send(response.toJson(messages['en'].instituteStudent.create_success, newStudent));

    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            return res.status(400).send(
                response.toJson(messages['en'].instituteStudent.email_exists)
            );
        }
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
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

        const batchId = req.query.batchId;
        const status = req.query.status;
        const name = req.query.name;
        const email = req.query.email;
        countryCode = req.query.countryCode;
        countryCodeName = req.query.countryCodeName;
        const phone = req.query.phone;
        const search = req.query.search;

        // pagination
        const page = parseInt(req.query.page) || 1;
        const pageSize = CommonConfig.instituteCourseListLimit || 10;
        const skip = (page - 1) * pageSize;

        const sortBy = req.query.sortBy || "createdAt";
        const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

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
        if (countryCode) filter.countryCode = { $regex: countryCode, $options: "i" };
        if (countryCodeName) filter.countryCodeName = { $regex: countryCodeName, $options: "i" };
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
            .select("enrollmentNo firstName lastName email phone batchId CourseId status countryCode countryCodeName")
            .populate({
                path: "batchId",
                select: "batchName"
            })
            .populate({
                path: "CourseId",
                select: "name"
            })
            .sort(sort)
            .skip(skip)
            .limit(pageSize);

        const formattedStudents = students.map(student => ({
            _id: student._id,
            enrollmentNo: student.enrollmentNo,
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            phone: student.phone,
            countryCode: student.countryCode,
            countryCodeName: student.countryCodeName,
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
            total,
            currentPage: page,
            totalPages: total > 0 ? Math.ceil(total / pageSize) : 0
        });

    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
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
            countryCode: student.countryCode,
            countryCodeName: student.countryCodeName,
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

    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
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
            CourseId,
            batchId,
            subCourseId,
            prefixName,
            firstName,
            lastName,
            email,
            countryCode,
            countryCodeName,
            phone,
            alternatePhone,
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
            profilePicture,
            isCoordinator,
            status
        } = req.body;

        // check if student exists and not deleted
        const student = await InstituteStudentsModel.findOne({
            _id: studentId,
            isDeleted: false
        });

        if (!student) {
            return res.status(404).send(
                response.toJson(messages['en'].instituteStudent.not_exists)
            );
        }

        //  check if new CourseId, batchId, subCourseId (if provided) are valid
        if (CourseId) {
            const courseExists = await InstituteCoursesModel.findOne({ _id: CourseId, isDeleted: false });
            if (!courseExists) return res.status(404).send(response.toJson(messages['en'].common.not_exists));
        }

        if (batchId) {
            const batchExists = await InstituteBatchesModel.findOne({ _id: batchId, isDeleted: false });
            if (!batchExists) return res.status(404).send(response.toJson(messages['en'].instituteBatch.not_exists));
        }

        if (req.body.hasOwnProperty('subCourseId') && subCourseId) {
            const subCourseExists = await InstituteSubCoursesModel.findOne({ _id: subCourseId, isDeleted: false });
            if (!subCourseExists) return res.status(404).send(response.toJson(messages['en'].instituteCourse.subcourse_invalid));
        }

        // check duplicates if email or phone is being updated (or if batch/course/subcourse is changing, then also check with existing email/phone)
        const finalBatchId = batchId || student.batchId;
        const finalCourseId = CourseId || student.CourseId;
        const finalSubCourseId = (req.body.hasOwnProperty('subCourseId') ? subCourseId : student.subCourseId) || null;
        const finalEmail = email ? email.toLowerCase() : student.email;
        const finalPhone = phone || student.phone;

        const orClause = [];
        const baseQuery = { 
            batchId: finalBatchId, 
            CourseId: finalCourseId, 
            subCourseId: finalSubCourseId,
            isDeleted: false,
            _id: { $ne: studentId }
        };

        if (finalEmail) orClause.push({ ...baseQuery, email: finalEmail });
        if (finalPhone) orClause.push({ ...baseQuery, phone: finalPhone });

        if (orClause.length > 0) {
            const duplicate = await InstituteStudentsModel.findOne({ $or: orClause });
            if (duplicate) {
                if (duplicate.email === finalEmail) {
                    return res.status(400).send(response.toJson(messages['en'].instituteStudent.email_exists));
                }
                return res.status(400).send(response.toJson(messages['en'].instituteStudent.phone_exists));
            }
        }

        // update fields if provided
        if (CourseId) student.CourseId = CourseId;
        if (batchId) student.batchId = batchId;
        if (req.body.hasOwnProperty('subCourseId')) student.subCourseId = subCourseId || null;

        if (prefixName) student.prefixName = prefixName.toUpperCase();
        if (firstName) student.firstName = firstName;
        if (lastName) student.lastName = lastName;
        if (email) student.email = email.toLowerCase();
        if (phone) student.phone = phone;
        
        if (countryCode) student.countryCode = countryCode;
        if (countryCodeName) student.countryCodeName = countryCodeName;
        if (alternatePhone) student.alternatePhone = alternatePhone;
        if (gender) student.gender = gender.toUpperCase();
        if (dateOfBirth) student.dateOfBirth = dateOfBirth;
        if (age !== undefined) student.age = age;
        if (state) student.state = state;
        if (city) student.city = city;
        if (highestEducation) student.highestEducation = highestEducation;
        if (currentDesignation) student.currentDesignation = currentDesignation;
        if (yearsOfExperienceRealEstate !== undefined) student.yearsOfExperienceRealEstate = yearsOfExperienceRealEstate;
        if (courseStartDate) student.courseStartDate = courseStartDate;
        
        if (holdingSeat !== undefined) student.holdingSeat = holdingSeat;
        if (enrolledCourse !== undefined) student.enrolledCourse = enrolledCourse;
        if (isCoordinator !== undefined) student.isCoordinator = isCoordinator;
        if (status) student.status = status;

        if (documentsSubmitted) student.documentsSubmitted = documentsSubmitted;
        if (profilePicture) student.profilePicture = profilePicture;

        student.updatedBy = req.user?._id;
        student.updatedAt = new Date();

        await student.save();

        return res.status(200).send(
            response.toJson(messages['en'].common.update_success, student)
        );

    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
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

    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
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
    } catch (err) {
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
    deleteStudent,
    courseDropdownList
};