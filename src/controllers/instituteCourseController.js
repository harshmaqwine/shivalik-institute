const messages = require("../message/index.js");
const response = require("../config/response.js");
const { validationResult } = require('express-validator');
const CommonConfig = require('../config/common.js');
const CommonFun = require('../libs/common.js');
const InstituteSubCoursesModel = require("../models/instituteSubCourses.js");
const InstituteCoursesModel = require("../models/instituteCourses.js");
const InstituteBatchesModel = require("../models/instituteBatches.js");
const { InstituteModulesModel } = require('../models/instituteModules.js');
const { InstituteLectures } = require("../models/instituteLectures.js");
const expertsModel = require("../models/experts.js");

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

        const name = req.body.name ? (req.body.name).trim() : null;

        const existsCourse = await InstituteCoursesModel.findOne({ name: name });
        if (existsCourse) {
            return res.status(404).send(response.toJson(messages['en'].common.exists));
        }

        await InstituteCoursesModel.create({
            name: name,
            price: req.body.price || "",
            discount: req.body.discount || "",
            // createdBy : req.user._id
        });

        return res.status(200).send(response.toJson(messages['en'].common.create_success));
    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
}

// update course, all fields are optional.
const updateCourse = async (req, res) => {
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

        const courseId = req.params.courseId;
        const course = await InstituteCoursesModel.findById(courseId);
        if (!course) {
            return res.status(404).send(response.toJson(messages['en'].instituteCourse.course_not_exist));
        }
        let name = course.name;
        if (req.body.name) {
            name = req.body.name.trim();
            if (!name) {
                return res.status(400).send(response.toJson("Course name is required"));
            }
            const existsCourse = await InstituteCoursesModel.findOne({
                name: { $regex: `^${name}$`, $options: "i" },
                _id: { $ne: courseId }
            });

            if (existsCourse) {
                return res.status(409).send(response.toJson(messages['en'].common.exists));
            }
        }
        await InstituteCoursesModel.findByIdAndUpdate(courseId, {
            name,
            price: req.body.price ?? course.price,
            discount: req.body.discount ?? course.discount,
            status: req.body.status || course.status,
            // updatedBy: req.user._id,
            updatedAt: new Date()
        });
        return res.status(200).send(response.toJson(messages['en'].common.update_success));
    } catch (err) {
        console.error("Error updating course:", err);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).send(response.toJson(err.message || err));
    }
};

// delete course, soft delete.
const deleteCourse = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(response.toJson(errors.errors[0].msg));
    }

    const courseId = req.params.courseId;
    try {
        // Check if the course exists and is not already deleted
        const course = await InstituteCoursesModel.findOne({ _id: courseId, isDeleted: false });

        if (!course) {
            return res.status(404).send(response.toJson(messages['en'].instituteCourse.course_not_exist));
        }

        // Check if the course has any sub-courses
        const subCourses = await InstituteSubCoursesModel.find({ instituteCourseId: courseId, isDeleted: false });
        if (subCourses.length > 0) {
            return res.status(400).send(response.toJson(messages['en'].instituteCourse.course_exists));
        }

        // Soft delete the course
        await InstituteCoursesModel.findByIdAndUpdate(courseId, {
            isDeleted: true,
            deletedAt: new Date()
        });

        return res.status(200).send(response.toJson(messages['en'].common.delete_success));
    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
}

const createSubCourse = async (req, res) => {
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

        const name = req.body.name ? (req.body.name).trim() : null;

        const existsSubCourse = await InstituteSubCoursesModel.findOne({
            instituteCourseId: req.body.instituteCourseId,
            name: name
        });
        if (existsSubCourse) {
            return res.status(404).send(response.toJson(messages['en'].common.exists));
        }

        await InstituteSubCoursesModel.create({
            instituteCourseId: req.body.instituteCourseId,
            name: name,
            price: req.body.price || "",
            discount: req.body.discount || "",
            // createdBy : req.user._id
        });

        return res.status(200).send(response.toJson(messages['en'].common.create_success));
    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
}

// update sub course, all fields are optional.
const updateSubCourse = async (req, res) => {
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

        const subCourseId = req.params.subCourseId;
        const subCourse = await InstituteSubCoursesModel.findById(subCourseId);
        if (!subCourse) {
            return res.status(404).send(response.toJson(messages['en'].instituteCourse.subcourse_invalid));
        }
        let name = subCourse.name;
        if (req.body.name) {
            name = req.body.name.trim();
            if (!name) {
                return res.status(400).send(response.toJson("Sub course name is required"));
            }
            const existsSubCourse = await InstituteSubCoursesModel.findOne({
                instituteCourseId: subCourse.instituteCourseId,
                name: { $regex: `^${name}$`, $options: "i" },
                _id: { $ne: subCourseId }
            });
            if (existsSubCourse) {
                return res.status(404).send(response.toJson(messages['en'].common.exists));
            }
        }

        await InstituteSubCoursesModel.findByIdAndUpdate(subCourseId, {
            name: name,
            price: req.body.price || subCourse.price,
            discount: req.body.discount || subCourse.discount,
            status: req.body.status || subCourse.status,
            // updatedBy: req.user._id,
            updatedAt: new Date(),
        });

        return res.status(200).send(response.toJson(messages['en'].common.update_success));

    } catch (err) {
        console.error("Error updating sub course:", err);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).send(response.toJson(err.message || err));
    }
}

// delelete sub course, soft delete.
const deleteSubCourse = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(response.toJson(errors.errors[0].msg));
    }
    const subCourseId = req.params.subCourseId;
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

        const subCourse = await InstituteSubCoursesModel.findOne({ _id: subCourseId, isDeleted: false });
        if (!subCourse) {
            return res.status(404).send(response.toJson(messages['en'].instituteCourse.subcourse_invalid));
        }

        const batches = await InstituteBatchesModel.find({ instituteSubCourseId: subCourseId, isDeleted: false });
        if (batches.length > 0) {
            return res.status(400).send(response.toJson(messages['en'].instituteCourse.course_exists));
        }
        // Soft delete the sub course
        await InstituteSubCoursesModel.findByIdAndUpdate(subCourseId, {
            isDeleted: true,
            deletedAt: new Date()
        });
        return res.status(200).send(response.toJson(messages['en'].common.delete_success));
    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
}

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

        const page = parseInt(req.query.page) || 1;
        const pageSize = CommonConfig.instituteCourseListLimit || 10;
        const skip = (page - 1) * pageSize;

        let reqSortBy = req.query.sortBy || 'createdAt';
        const orderBy = req.query.sort === 'ASC' ? 1 : -1;
        const sorting = { [reqSortBy]: orderBy };

        const baseQuery = { 
            isDeleted: false,
        };

        const [courses, total] = await Promise.all([
            InstituteCoursesModel.find(baseQuery)
                .select('-__v -deletedAt -isDeleted')
                .sort(sorting)
                .skip(skip)
                .limit(pageSize)
                .populate({
                    path: 'subCourses',
                    match: { isDeleted: false },
                    select: '_id name price discount status'
                })
                .lean(),

            InstituteCoursesModel.countDocuments(baseQuery)
        ]);

        return res.status(200).send(
            response.toJson(messages['en'].common.list_success, {
                courses,
                total,
                currentPage: page,
                totalPages: Math.ceil(total / pageSize)
            })
        );

    } catch (err) {
        console.log(err);
        return res.status(500).send(
            response.toJson(err.message || err)
        );
    }
};

// details of course.
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
        const courseId = req.params.courseId;
        const course = await InstituteCoursesModel.findOne({
            _id: courseId, isDeleted: false
        }).select('-__v -deletedAt -isDeleted')
        return res.status(200).send(
            response.toJson(messages['en'].common.details_success, course)
        );

    } catch (err) {
        console.log(err);
        return res.status(500).send(
            response.toJson(err.message || err)
        );
    }
};

// details of sub course.
const subCourseDetails = async (req, res) => {
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

        const subCourseId = req.params.subCourseId;
        const subCourse = await InstituteSubCoursesModel.findOne({
            _id: subCourseId,
            isDeleted: false
        })
            .select('-__v -deletedAt -isDeleted')
            .populate({
                path: 'instituteCourseId',
                select: 'name status price discount createdAt'
            });

        if (!subCourse) {
            return res.status(404).send(
                response.toJson(messages['en'].instituteCourse.subcourse_invalid)
            );
        }

        const subCourseObj = subCourse.toObject();

        const formattedResponse = {
            ...subCourseObj,
            courseDetails: subCourseObj.instituteCourseId
                ? {
                    name: subCourseObj.instituteCourseId.name,
                    status: subCourseObj.instituteCourseId.status,
                    price: subCourseObj.instituteCourseId.price,
                    discount: subCourseObj.instituteCourseId.discount,
                    createdAt: subCourseObj.instituteCourseId.createdAt
                }
                : null
        };
        delete formattedResponse.instituteCourseId;

        return res.status(200).send(
            response.toJson(
                messages['en'].common.details_success,
                formattedResponse
            )
        );
    } catch (err) {
        console.log(err);
        return res.status(500).send(
            response.toJson(err.message || err)
        );
    }
};

const publicList = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(response.toJson(errors.errors[0].msg));
    }

    try {
        const page = req.query.page - 1;
        const pageSize = CommonConfig.instituteCourseListLimit;

        let reqSortBy = req.query.sortBy || 'createdAt';
        const orderBy = req.query.sort && req.query.sort == 'ASC' ? -1 : 1;
        const sorting = { [reqSortBy]: orderBy };

        let baseQuery = {
            // status : 'ACTIVE',
            isDeleted: false,
        }

        let [rawUsers, total] = await Promise.all([
            InstituteCoursesModel.find(baseQuery)
                .sort(sorting)
                .populate({
                    path: 'subCourses',
                    select: '_id name price discount status'
                })
                .lean(),
            InstituteCoursesModel.countDocuments(baseQuery)
        ]);

        // Manual pagination on the filtered list
        const paginatedUsers = rawUsers.slice(
            parseInt(page) * parseInt(pageSize),
            parseInt(page) * parseInt(pageSize) + parseInt(pageSize)
        );

        const fieldsToRemove = ['__v', 'createdAt', 'updatedAt', 'deletedAt', 'isDeleted'];
        const fieldsToAdd = (data) => ({
            // fullName : `${data.firstName} ${data.lastName}`,
            // createdAtNew : data.createdAt.toISOString(),
        });

        let courses = await Promise.all(
            paginatedUsers.map(async (source) => {
                return CommonFun.transformObject(source, fieldsToRemove, fieldsToAdd);
            })
        );

        const data = {
            courses,
            total,
        }

        return res.status(200).send(response.toJson(messages['en'].common.list_success, data));

    } catch (err) {
        console.log(err);
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
}

const subCourcePublicList = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(response.toJson(errors.errors[0].msg));
    }

    try {
        const page = req.query.page - 1;
        const pageSize = CommonConfig.instituteCourseListLimit;

        let reqSortBy = req.query.sortBy || 'createdAt';
        const orderBy = req.query.sort && req.query.sort == 'ASC' ? -1 : 1;
        const sorting = { [reqSortBy]: orderBy };

        let baseQuery = {
            // status : 'ACTIVE',
            isDeleted: false,
        }

        if (req.query.instituteCourseId) {
            baseQuery = {
                ...baseQuery,
                instituteCourseId: req.query.instituteCourseId,
            }
        }

        let [rawUsers, total] = await Promise.all([
            InstituteSubCoursesModel.find(baseQuery)
                .sort(sorting)
                // .populate({
                //     path: 'subCourses',
                //     select: '_id name price discount status'
                // })
                .lean(),
            InstituteSubCoursesModel.countDocuments(baseQuery)
        ]);

        // Manual pagination on the filtered list
        const paginatedUsers = rawUsers.slice(
            parseInt(page) * parseInt(pageSize),
            parseInt(page) * parseInt(pageSize) + parseInt(pageSize)
        );

        const fieldsToRemove = ['__v', 'createdAt', 'updatedAt', 'deletedAt'];
        const fieldsToAdd = (data) => ({
            // fullName : `${data.firstName} ${data.lastName}`,
            // createdAtNew : data.createdAt.toISOString(),
        });

        let subCourses = await Promise.all(
            paginatedUsers.map(async (source) => {
                return CommonFun.transformObject(source, fieldsToRemove, fieldsToAdd);
            })
        );

        const data = {
            subCourses,
            total,
        }

        return res.status(200).send(response.toJson(messages['en'].common.list_success, data));

    } catch (err) {
        console.log(err);
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
}

// get sub course list.
const listSubCourse = async (req, res) => {
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

        const page = parseInt(req.query.page) || 1;
        const pageSize = 10;
        const skip = (page - 1) * pageSize;

        const baseQuery = { isDeleted: false };

        if (req.query.instituteCourseId) {
            baseQuery.instituteCourseId = req.query.instituteCourseId;
        }

        const [subCourses, total] = await Promise.all([
            InstituteSubCoursesModel.find(baseQuery)
                .populate({
                    path: 'instituteCourseId',
                    select: 'name'
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageSize)
                .lean(),
            InstituteSubCoursesModel.countDocuments(baseQuery)
        ]);

        const formattedData = subCourses.map(item => ({
            _id: item._id,
            name: item.name,
            price: item.price,
            discount: item.discount,
            status: item.status,
            courseName: item.instituteCourseId?.name || null
        }));

        return res.status(200).send(
            response.toJson(messages['en'].common.list_success, {
                subCourses: formattedData,
                total,
                currentPage: page,
                totalPages: Math.ceil(total / pageSize)
            })
        );

    } catch (err) {
        console.log(err);
        return res.status(500).send(response.toJson(err.message));
    }
};

// get batch list.
const batchPublicList = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(response.toJson(errors.errors[0].msg));
    }

    try {
        const page = req.query.page - 1;
        const pageSize = CommonConfig.instituteCourseListLimit;

        let reqSortBy = req.query.sortBy || 'createdAt';
        const orderBy = req.query.sort && req.query.sort == 'ASC' ? -1 : 1;
        const sorting = { [reqSortBy]: orderBy };

        let baseQuery = {
            // status : 'ACTIVE',
            isDeleted: false,
        }

        if (req.query.status) {
            baseQuery = {
                ...baseQuery,
                status: req.query.status,
            }
        }

        if (req.query.instituteCourseId) {
            baseQuery = {
                ...baseQuery,
                instituteCourseId: req.query.instituteCourseId,
            }
        }

        if (req.query.instituteSubCourseId) {
            baseQuery = {
                ...baseQuery,
                instituteSubCourseId: req.query.instituteSubCourseId,
            }
        }

        let [rawUsers, total] = await Promise.all([
            InstituteBatchesModel.find(baseQuery)
                .sort(sorting)
                // .populate({
                //     path: 'subCourses',
                //     select: '_id name price discount status'
                // })
                .lean(),
            InstituteBatchesModel.countDocuments(baseQuery)
        ]);

        // Manual pagination on the filtered list
        const paginatedUsers = rawUsers.slice(
            parseInt(page) * parseInt(pageSize),
            parseInt(page) * parseInt(pageSize) + parseInt(pageSize)
        );

        const fieldsToRemove = ['__v', 'createdAt', 'updatedAt', 'deletedAt', 'isDeleted'];
        const fieldsToAdd = (data) => ({
            // fullName : `${data.firstName} ${data.lastName}`,
            // createdAtNew : data.createdAt.toISOString(),
        });

        let batches = await Promise.all(
            paginatedUsers.map(async (source) => {
                return CommonFun.transformObject(source, fieldsToRemove, fieldsToAdd);
            })
        );

        const data = {
            batches,
            total,
        }

        return res.status(200).send(response.toJson(messages['en'].common.list_success, data));

    } catch (err) {
        console.log(err);
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
}

// institute batches
const createBatch = async (req, res) => {
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

        // start time must be before end time
        if (req.body.startTime && req.body.endTime) {

            const startTime = req.body.startTime.split(':');
            const endTime = req.body.endTime.split(':');

            if (startTime[0] >= endTime[0]) {
                return res.status(404).send(response.toJson(messages['en'].instituteCourse.start_end_time_invalid));
            }
        }

        const instituteCourseId = req.body.instituteCourseId;
        const instituteSubCourseId = req.body.instituteSubCourseId;

        // course exist
        const existsCourse = await InstituteCoursesModel.findOne({ _id: instituteCourseId });
        if (!existsCourse) {
            return res.status(404).send(response.toJson(messages['en'].instituteCourse.course_not_exist));
        }

        if (instituteSubCourseId) {
            // sub course exist and parent is course
            const existsSubCourse = await InstituteSubCoursesModel.findOne({
                _id: instituteSubCourseId,
                instituteCourseId: instituteCourseId
            });

            if (!existsSubCourse) {
                return res.status(404).send(response.toJson(messages['en'].instituteCourse.subcourse_invalid));
            }
        }

        const batchName = req.body.batchName ? (req.body.batchName).trim() : null;
        const slug = await CommonFun.createSlug(batchName);

        // batch exist
        const existsBatch = await InstituteBatchesModel.findOne({ slug: slug });
        if (existsBatch) {
            return res.status(404).send(response.toJson(messages['en'].instituteCourse.batch_exists));
        }

        await InstituteBatchesModel.create({
            instituteCourseId: req.body.instituteCourseId,
            instituteSubCourseId: req.body.instituteSubCourseId || null,
            batchName: batchName,
            slug: slug,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            shift: req.body.shift,
            orientationDate: req.body.orientationDate || "",
            registrationEndDate: req.body.registrationEndDate,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            // createdBy: req.user._id
        });

        return res.status(200).send(response.toJson(messages['en'].common.create_success));


    } catch (err) {
        console.log(err);
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
}

const updateBatch = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(response.toJson(errors.errors[0].msg));
    }

    try {
        // const allowedRoles = ["SuperAdmin", "InstituteManager"];
        // const userHasAccess = req.user.userRoles?.some(role => allowedRoles.includes(role));
        // if (!userHasAccess) {
        //     return res.status(404).send(response.toJson(messages['en'].auth.not_access));
        // }

        // start time must be before end time
        if (req.body.startTime && req.body.endTime) {

            const startTime = req.body.startTime.split(':');
            const endTime = req.body.endTime.split(':');

            if (startTime[0] >= endTime[0]) {
                return res.status(404).send(response.toJson(messages['en'].instituteCourse.start_end_time_invalid));
            }
        }

        // batch exist
        const batchId = req.params.batchId;
        const batch = await InstituteBatchesModel.findById(batchId);
        if (!batch) {
            return res.status(404).send(response.toJson(messages['en'].instituteCourse.batch_not_exist));
        }

        const { instituteCourseId, instituteSubCourseId, batchName } = req.body;

        // course exist
        const existsCourse = await InstituteCoursesModel.findOne({ _id: instituteCourseId });
        if (!existsCourse) {
            return res.status(404).send(response.toJson(messages['en'].instituteCourse.course_not_exist));
        }


        // sub course exist and parent is course
        const subCourseIdToCheck = instituteSubCourseId || batch.instituteSubCourseId;
        if (subCourseIdToCheck) {
            const existsSubCourse = await InstituteSubCoursesModel.findOne({
                _id: subCourseIdToCheck,
                instituteCourseId: instituteCourseId
            });

            if (!existsSubCourse) {
                return res.status(404).send(response.toJson(messages['en'].instituteCourse.subcourse_invalid));
            }
        }

        // Check batch name uniqueness (exclude current batch)
        let newBatchName = batchName ? (batchName).trim() : batch.batchName;
        const slug = await CommonFun.createSlug(newBatchName);

        const existsBatch = await InstituteBatchesModel.findOne({ slug: slug, _id: { $ne: batch._id } });
        if (existsBatch) {
            return res.status(404).send(response.toJson(messages['en'].instituteCourse.batch_exists));
        }

        await InstituteBatchesModel.updateOne({ _id: batch._id }, {
            $set: {
                ...req.body,
                batchName: newBatchName,
                slug: slug,
                // updatedBy: req.user._id,
                updatedAt: new Date()
            }
        });

        return res.status(200).send(response.toJson(messages['en'].common.update_success));

    } catch (err) {
        console.log(err);
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
}

// delete batch, soft delete.
const deleteBatch = async (req, res) => {
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

        const batchId = req.params.batchId;
        const batch = await InstituteBatchesModel.findById(batchId);
        if (!batch) {
            return res.status(404).send(response.toJson(messages['en'].instituteCourse.batch_not_exist));
        }
        // checkin lecture exist for batch
        const lectureCount = await InstituteLectures.countDocuments({ batchId: batchId });
        if (lectureCount > 0) {
            return res.status(400).send(response.toJson(messages['en'].instituteCourse.batch_has_lectures));
        }

        await InstituteBatchesModel.findByIdAndUpdate(batchId, {
            isDeleted: true,
            deletedAt: new Date()
        });
        return res.status(200).send(response.toJson(messages['en'].common.delete_success));
    }
    catch (err) {
        console.log(err);
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
}

const listBatch = async (req, res) => {
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
        const page = req.query.page ? parseInt(req.query.page) - 1 : 0;
        const pageSize = req.query.pageSize
            ? parseInt(req.query.pageSize)
            : (CommonConfig.instituteBatchListLimit || 10);

        // Sorting
        let reqSortBy = req.query.sortBy || 'createdAt';
        const orderBy = req.query.sort && req.query.sort === 'ASC' ? -1 : 1;
        const sorting = { [reqSortBy]: orderBy };

        // Filters
        const filters = {
            instituteCourseId: req.query.instituteCourseId,
            instituteSubCourseId: req.query.instituteSubCourseId,
            type: req.query.type,
        };
        let baseQuery = { isDeleted: false };
        if (filters.instituteCourseId) {
            baseQuery.instituteCourseId = filters.instituteCourseId;
        }
        if (filters.instituteSubCourseId) {
            baseQuery.instituteSubCourseId = filters.instituteSubCourseId;
        }

        // Fetch batches with populate for course/subCourse
        let rawBatches = await InstituteBatchesModel.find(baseQuery)
            .sort(sorting)
            .populate({ path: 'instituteCourseId', select: 'name' })
            .populate({ path: 'instituteSubCourseId', select: 'name' })
            .lean();

        const parseDate = (val) => {
            if (!val || typeof val !== 'string') return null;
            const tmp = new Date(val);
            if (isNaN(tmp.getTime())) return null;
            return new Date(Date.UTC(tmp.getUTCFullYear(), tmp.getUTCMonth(), tmp.getUTCDate()));
        };

        const now = new Date();
        const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        let filtered = rawBatches;
        if (filters.type) {
            const typeLower = String(filters.type).toLowerCase();
            filtered = rawBatches.filter((b) => {
                const s = parseDate(b.startDate);
                const e = parseDate(b.endDate);
                if (!s || !e) return false;
                const isCompleted = e < todayUTC;
                const isUpcoming = s > todayUTC;
                const isOngoing = s <= todayUTC && todayUTC <= e;

                if (typeLower === 'completed') return isCompleted;
                if (typeLower === 'upcoming') return isUpcoming;
                if (typeLower === 'ongoing') return isOngoing;
                return true;
            });
        }

        const total = filtered.length;

        // Manual pagination
        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;

        const paginated = filtered.slice(startIndex, endIndex);

        const batches = paginated.map((item) => {
            const courseName = item.instituteCourseId?.name || "";
            const subCourseName = item.instituteSubCourseId?.name || "";

            return {
                _id: item._id,
                batchName: item.batchName,
                slug: item.slug,
                startTime: item.startTime,
                endTime: item.endTime,
                shift: item.shift,
                orientationDate: item.orientationDate,
                registrationEndDate: item.registrationEndDate,
                startDate: item.startDate,
                endDate: item.endDate,
                status: item.status,
                courseName,
                subCourseName
            };
        });

        return res.status(200).send(
            response.toJson(messages['en'].common.list_success, { batches, total })
        );

    } catch (err) {
        console.log(err);
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

// details of batch
const batchDetails = async (req, res) => {
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
        const batchId = req.params.batchId;
        const batch = await InstituteBatchesModel.findOne({
            _id: batchId,
            isDeleted: false
        })
            .populate({
                path: 'instituteCourseId',
                select: 'name status price discount createdAt'
            })
            .populate({
                path: 'instituteSubCourseId',
                select: 'name status price discount createdAt'
            })
            .select('-__v -deletedAt -isDeleted')
            .lean();

        if (!batch) {
            return res.status(404).send(
                response.toJson(messages['en'].instituteCourse.batch_not_exist)
            );
        }

        const formattedResponse = {
            _id: batch._id,
            batchName: batch.batchName,
            slug: batch.slug,
            startTime: batch.startTime,
            endTime: batch.endTime,
            shift: batch.shift,
            orientationDate: batch.orientationDate,
            registrationEndDate: batch.registrationEndDate,
            startDate: batch.startDate,
            endDate: batch.endDate,
            status: batch.status,

            courseDetails: batch.instituteCourseId
                ? {
                    name: batch.instituteCourseId.name,
                    status: batch.instituteCourseId.status,
                    price: batch.instituteCourseId.price,
                    discount: batch.instituteCourseId.discount,
                    createdAt: batch.instituteCourseId.createdAt
                }
                : null,

            subCourseDetails: batch.instituteSubCourseId
                ? {
                    name: batch.instituteSubCourseId.name,
                    status: batch.instituteSubCourseId.status,
                    price: batch.instituteSubCourseId.price,
                    discount: batch.instituteSubCourseId.discount,
                    createdAt: batch.instituteSubCourseId.createdAt
                }
                : null
        };

        return res.status(200).send(
            response.toJson(
                messages['en'].common.details_success,
                formattedResponse
            )
        );
    } catch (err) {
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

//get global sub course _id & name list for dropdown, based on course
const subCourseDropdownList = async (req, res) => {
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
        const baseQuery = { isDeleted: false };
        if (req.query.instituteCourseId) {
            baseQuery.instituteCourseId = req.query.instituteCourseId;
        }
        const subCourses = await InstituteSubCoursesModel.find(baseQuery, { _id: 1, name: 1 }).lean();
        return res.status(200).send(response.toJson(messages['en'].common.list_success, { subCourses }));
    }
    catch (err) {
        console.log(err);
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

// get global batch _id & name list for dropdown, based on course and sub course
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

// create module exports
const createModule = async (req, res) => {
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

        const moduleData = {
            ...req.body,
            // createdBy: req.user._id
        };
        const newModule = new InstituteModulesModel(moduleData);
        await newModule.save();
        return res.status(200).send(response.toJson(messages['en'].common.create_success, { module: newModule }));

    } catch (err) {
        console.log(err);
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
}

// update module
const updateModule = async (req, res) => {
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
        const moduleId = req.params.moduleId;
        const module = await InstituteModulesModel.findById(moduleId);
        if (!module) {
            return res.status(404).send(response.toJson(messages['en'].instituteCourse.module_not_exist));
        }
        await InstituteModulesModel.updateOne({ _id: moduleId }, {
            $set: {
                ...req.body,
                // updatedBy: req.user._id,
                updatedAt: new Date()
            }
        });
        return res.status(200).send(response.toJson(messages['en'].common.update_success));
    }
    catch (err) {
        console.log(err);
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
}

// get list module
const listModule = async (req, res) => {
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
        const courseId = req.query.courseId;
        const subCourseId = req.query.subCourseId;
        const baseQuery = { isDeleted: false };
        if (courseId) {
            baseQuery.instituteCourseId = courseId;
        }
        if (subCourseId) {
            baseQuery.instituteSubCourseId = subCourseId;
        }
        const modules = await InstituteModulesModel.find(baseQuery)
            .populate("instituteCourseId", "name")
            .populate("instituteSubCourseId", "name")
            .lean();
        const formattedModules = modules.map(
            ({
                instituteCourseId,
                instituteSubCourseId,
                createdAt,
                updatedAt,
                __v,
                ...rest
            }) => ({
                ...rest,
                courseName: instituteCourseId?.name || null,
                subCourseName: instituteSubCourseId?.name || null
            })
        );
        return res.status(200).send(response.toJson(messages['en'].common.list_success, { modules: formattedModules }));
    }
    catch (err) {
        console.log(err);
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
}

// details of module
const moduleDetails = async (req, res) => {
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
        
        const moduleId = req.params.moduleId;
        const module = await InstituteModulesModel.findOne({
            _id: moduleId,
            isDeleted: false
        })
            .populate("instituteCourseId", "name")
            .populate("instituteSubCourseId", "name")
            .lean();

        if (!module) {
            return res.status(404).send(
                response.toJson(messages['en'].instituteCourse.module_not_exist)
            );
        }

        const formattedResponse = {
            _id: module._id,
            moduleNumber: module.moduleNumber,
            name: module.name,
            description: module.description,
            materialLink: module.materialLink,
            feedback: module.feedback,
            coordinator: module.coordinator,
            status: module.status,

            courseName: module.instituteCourseId?.name || null,
            subCourseName: module.instituteSubCourseId?.name || null,

            isDeleted: module.isDeleted,
            createdAt: module.createdAt,
            updatedAt: module.updatedAt
        };

        return res.status(200).send(
            response.toJson(messages['en'].common.details_success, formattedResponse)
        );
    } catch (err) {
        console.log(err);
        return res.status(500).send(response.toJson(err.message));
    }
};

// delete module, soft delete
const deleteModule = async (req, res) => {
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
        const moduleId = req.params.moduleId;
        const module = await InstituteModulesModel.findById(moduleId);
        if (!module) {
            return res.status(404).send(response.toJson(messages['en'].instituteCourse.module_not_exist));
        }
        await InstituteModulesModel.findByIdAndUpdate(moduleId, {
            isDeleted: true,
            deletedAt: new Date()
        });
        return res.status(200).send(response.toJson(messages['en'].common.delete_success));
    }
    catch (err) {
        console.log(err);
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
}

//get global experts _id & name list for dropdown 
const expertDropdownList = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(
            response.toJson(errors.array()[0].msg)
        );
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
            filters.status = req.query.status;
        }

        if (req.query.search) {
            filters.$text = { $search: req.query.search };
        }

        const experts = await expertsModel.Experts.find(
            filters,
            { _id: 1, name: 1 }
        )
            .sort({ name: 1 })   // optional alphabetical sort
            .lean();

        return res.status(200).send(
            response.toJson(
                messages['en'].common.list_success,
                { experts }
            )
        );

    } catch (err) {
        console.log(err);
        return res.status(500).send(
            response.toJson(err.message)
        );
    }
};

// create lecture.
const createLecture = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(
            response.toJson(errors.errors[0].msg)
        );
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
            courseId,
            subCourseId,
            batchId,
            expertId,
            classroomNumber,
            lectureDate,
            lectureType,
            projectReviewLecture,
            sessionStartTime,
            sessionEndTime,
            material,
            createFeedbackForLearner,
            feedbackForCoordinator
        } = req.body;

        const course = await InstituteCoursesModel.findById(courseId);
        if (!course) {
            return res.status(404).send(
                response.toJson(messages['en'].instituteCourse.course_not_exist)
            );
        }
        if (subCourseId) {
            const subCourse = await InstituteSubCoursesModel.findOne({
                _id: subCourseId,
                instituteCourseId: courseId
            });

            if (!subCourse) {
                return res.status(404).send(
                    response.toJson(messages['en'].instituteCourse.subcourse_invalid)
                );
            }
        }
        if (batchId) {
            const batch = await InstituteBatchesModel.findById(batchId);
            if (!batch) {
                return res.status(404).send(
                    response.toJson(messages['en'].instituteCourse.batch_not_exist)
                );
            }
        }
        const expert = await expertsModel.Experts.findById(expertId);
        if (!expert || expert.isDeleted) {
            return res.status(404).send(
                response.toJson(messages['en'].experts.not_exist)
            );
        }

        const lectureData = {
            courseId,
            subCourseId: subCourseId || null,
            batchId: batchId || null,
            expertId,
            classroomNumber,
            lectureDate,
            lectureType,
            sessionStartTime,
            sessionEndTime,
            material: material || null,
            createFeedbackForLearner: createFeedbackForLearner || false,
            feedbackForCoordinator: feedbackForCoordinator || null,
            projectReviewLecture: projectReviewLecture || false,
            // createdBy: req.user._id
        };

        // Save Lecture
        const newLecture = new InstituteLectures(lectureData);
        await newLecture.save();

        return res.status(201).send(
            response.toJson(
                messages['en'].common.create_success,
                { lecture: newLecture }
            )
        );

    } catch (err) {
        console.log(err);
        const statusCode = err.statusCode || 500;
        const errMess = err.message || messages['en'].common.server_error;
        return res.status(statusCode).send(
            response.toJson(errMess)
        );
    }
};

// update lecture.
const updateLecture = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(
            response.toJson(errors.errors[0].msg)
        );
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

        const lectureId = req.params.lectureId;
        const {
            courseId,
            subCourseId,
            batchId,
            expertId,
            classroomNumber,
            lectureDate,
            lectureType,
            projectReviewLecture,
            sessionStartTime,
            sessionEndTime,
            material,
            createFeedbackForLearner,
            feedbackForCoordinator
        } = req.body;
 
        const lecture = await InstituteLectures.findById(lectureId);
        if (!lecture) {
            return res.status(404).send(
                response.toJson(messages['en'].instituteCourse.lecture_not_exist)
            );
        }
 
        if (courseId) {
            const course = await InstituteCoursesModel.findById(courseId);
            if (!course) {
                return res.status(404).send(
                    response.toJson(messages['en'].instituteCourse.course_not_exist)
                );
            }
        }
 
        if (subCourseId) {
            const subCourse = await InstituteSubCoursesModel.findOne({
                _id: subCourseId,
                instituteCourseId: courseId
            });
            if (!subCourse) {
                return res.status(404).send(
                    response.toJson(messages['en'].instituteCourse.subcourse_invalid)
                );
            }
        }
 
        if (batchId) {
            const batch = await InstituteBatchesModel.findById(batchId);
            if (!batch) {
                return res.status(404).send(
                    response.toJson(messages['en'].instituteCourse.batch_not_exist)
                );
            }
        }
 
        if (expertId) {
            const expert = await expertsModel.Experts.findById(expertId);
            if (!expert || expert.isDeleted) {
                return res.status(404).send(
                    response.toJson(messages['en'].experts.not_exist)
                );
            }
        }
 
        const updatedData = {
            courseId,
            subCourseId: subCourseId || lecture.subCourseId,
            batchId: batchId || lecture.batchId,
            expertId: expertId || lecture.expertId,
            classroomNumber: classroomNumber || lecture.classroomNumber,
            lectureDate: lectureDate || lecture.lectureDate,
            lectureType: lectureType || lecture.lectureType,
            sessionStartTime: sessionStartTime || lecture.sessionStartTime,
            sessionEndTime: sessionEndTime || lecture.sessionEndTime,
            material: material || lecture.material,
            createFeedbackForLearner: createFeedbackForLearner !== undefined ? createFeedbackForLearner : lecture.createFeedbackForLearner,
            feedbackForCoordinator: feedbackForCoordinator || lecture.feedbackForCoordinator,
            projectReviewLecture: projectReviewLecture !== undefined ? projectReviewLecture : lecture.projectReviewLecture,
            updatedAt: new Date(),
            // updatedBy: req.user._id
        };

        await InstituteLectures.updateOne({ _id: lectureId }, { $set: updatedData });

        return res.status(200).send(
            response.toJson(messages['en'].common.update_success, { lecture: updatedData })
        );
    } catch (err) {
        console.log(err);
        const statusCode = err.statusCode || 500;
        const errMess = err.message || messages['en'].common.server_error;
        return res.status(statusCode).send(
            response.toJson(errMess)
        );
    }
};

// get lecture list.
const listLecture = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(
            response.toJson(errors.errors[0].msg)
        );
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
        const filters = { isDeleted: false };

        if (req.query.courseId) filters.courseId = req.query.courseId;
        if (req.query.subCourseId) filters.subCourseId = req.query.subCourseId;
        if (req.query.batchId) filters.batchId = req.query.batchId;
        if (req.query.expertId) filters.expertId = req.query.expertId;

        if (req.query.search) {
            filters.classroomNumber = {
                $regex: req.query.search,
                $options: "i"
            };
        }

        const lectures = await InstituteLectures.find(filters)
            .populate("batchId", "batchName")
            .populate("expertId", "name")
            .sort({ lectureDate: -1 })
            .lean();

        const formattedLectures = lectures.map((lecture) => ({
            _id: lecture._id,
            date: lecture.lectureDate,
            batchName: lecture.batchId?.batchName || null,
            expertName: lecture.expertId?.name || null,
            type: lecture.lectureType,
            time: `${lecture.sessionStartTime} - ${lecture.sessionEndTime}`,
            classroomNumber: lecture.classroomNumber,
            projectReviewLecture: lecture.projectReviewLecture,
            createFeedbackForLearner: lecture.createFeedbackForLearner
        }));

        return res.status(200).send(
            response.toJson(
                messages['en'].common.list_success,
                { lectures: formattedLectures }
            )
        );

    } catch (err) {
        console.log(err);
        return res.status(500).send(
            response.toJson(messages['en'].common.server_error)
        );
    }
};

// get lecture details.
const lectureDetails = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(
            response.toJson(errors.errors[0].msg)
        );
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
        const lectureId = req.params.lectureId;
        const lecture = await InstituteLectures.findOne({
            _id: lectureId,
            isDeleted: false
        })  
            .populate("courseId", "name")
            .populate("subCourseId", "name")
            .populate("batchId", "batchName")
            .populate("expertId", "name")
            .lean();
        if (!lecture) {
            return res.status(404).send(
                response.toJson(messages['en'].instituteCourse.lecture_not_exist)
            );
        }
        const formattedResponse = {
            _id: lecture._id,
            courseName: lecture.courseId?.name || null,
            subCourseName: lecture.subCourseId?.name || null,
            batchName: lecture.batchId?.batchName || null,
            expertName: lecture.expertId?.name || null,
            classroomNumber: lecture.classroomNumber,
            lectureDate: lecture.lectureDate,
            lectureType: lecture.lectureType,
            projectReviewLecture: lecture.projectReviewLecture,
            sessionStartTime: lecture.sessionStartTime,
            sessionEndTime: lecture.sessionEndTime,
            material: lecture.material,
            createFeedbackForLearner: lecture.createFeedbackForLearner,
            feedbackForCoordinator: lecture.feedbackForCoordinator,
            isDeleted: lecture.isDeleted,
            createdAt: lecture.createdAt,
            updatedAt: lecture.updatedAt
        };
        return res.status(200).send(
            response.toJson(
                messages['en'].common.details_success,
                formattedResponse
            )
        );
    } catch (err) {
        console.log(err);
        const statusCode = err.statusCode || 500;
        const errMess = err.message || messages['en'].common.server_error;
        return res.status(statusCode).send(
            response.toJson(errMess)
        );
    }
};

// delete lecture, soft delete.
const deleteLecture = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(
            response.toJson(errors.errors[0].msg)
        );
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
        const lectureId = req.params.lectureId;
        const lecture = await InstituteLectures.findOne(
            { _id: lectureId, isDeleted: false }
        );
        if (!lecture) {
            return res.status(404).send(
                response.toJson(messages['en'].instituteCourse.lecture_not_exist)
            );
        }
        await InstituteLectures.findByIdAndUpdate(lectureId, {
            isDeleted: true,
            deletedAt: new Date()
        });
        return res.status(200).send(
            response.toJson(messages['en'].common.delete_success)
        );
    }
    catch (err) {
        console.log(err);
        const statusCode = err.statusCode || 500;
        const errMess = err.message || messages['en'].common.server_error;
        return res.status(statusCode).send(
            response.toJson(errMess)
        );
    }
}

module.exports = {
    create,
    updateCourse,
    deleteCourse,
    createSubCourse,
    updateSubCourse,
    deleteSubCourse,
    list,
    details,
    subCourseDetails,
    publicList,
    createBatch,
    updateBatch,
    listBatch,
    batchDetails,
    batchPublicList,
    listSubCourse,
    deleteBatch,
    subCourcePublicList,
    courseDropdownList,
    subCourseDropdownList,
    batchDropdownList,
    createModule,
    updateModule,
    listModule,
    moduleDetails,
    deleteModule,
    expertDropdownList,
    createLecture,
    updateLecture,
    listLecture,
    lectureDetails,
    deleteLecture
}