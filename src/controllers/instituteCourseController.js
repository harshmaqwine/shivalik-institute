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
const InstituteStudentsModel = require("../models/instituteStudents.js");
const expertsModel = require("../models/instituteExperts.js");

// create course.
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

// create sub course.
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

// list courses with pagination and sorting.
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

        // pagination
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
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
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
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
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
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
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

// get sub course list.
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


        // pagination
        const page = parseInt(req.query.page) || 1;
        const pageSize = CommonConfig.instituteCourseListLimit || 10;
        const skip = (page - 1) * pageSize;

        // sorting
        const sortBy = req.query.sortBy || "createdAt";
        const sortOrder = req.query.sort === "asc" ? 1 : -1;

        const sortObject = {};
        sortObject[sortBy] = sortOrder;

        // Filter
        const baseQuery = { isDeleted: false };

        if (req.query.instituteCourseId) {
            baseQuery.instituteCourseId = req.query.instituteCourseId;
        }

        if (req.query.status) {
            baseQuery.status = req.query.status;
        }

        // Search
        if (req.query.search) {
            baseQuery.name = {
                $regex: req.query.search,
                $options: "i"
            };
        }

        // QUERY
        const [subCourses, total] = await Promise.all([

            InstituteSubCoursesModel.find(baseQuery)
                .populate({
                    path: 'instituteCourseId',
                    select: 'name'
                })
                .sort(sortObject)
                .skip(skip)
                .limit(pageSize)
                .lean(),

            InstituteSubCoursesModel.countDocuments(baseQuery)
        ]);

        // Response
        const formattedData = subCourses.map(item => ({
            _id: item._id,
            name: item.name,
            price: item.price,
            discount: item.discount,
            status: item.status,
            course: item.instituteCourseId ? {
                _id: item.instituteCourseId._id,
                name: item.instituteCourseId.name
            } : null
        }));

        return res.status(200).send(
            response.toJson(
                messages['en'].common.list_success,
                {
                    subCourses: formattedData,
                    total,
                    currentPage: page,
                    totalPages: Math.ceil(total / pageSize)
                }
            )
        );

    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
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
            batchSize: parseInt(req.body.batchSize) || 0,
            appAccessExpireDays: parseInt(req.body.appAccessExpireDays) || 0,
            // createdBy: req.user._id
        });

        return res.status(200).send(response.toJson(messages['en'].common.create_success));


    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
}

// update batch, all fields are optional.
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
                batchSize: req.body.batchSize !== undefined ? parseInt(req.body.batchSize) : batch.batchSize,
                appAccessExpireDays: req.body.appAccessExpireDays !== undefined ? parseInt(req.body.appAccessExpireDays) : batch.appAccessExpireDays,
                // updatedBy: req.user._id,
                updatedAt: new Date()
            }
        });

        return res.status(200).send(response.toJson(messages['en'].common.update_success));

    } catch (err) {
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
    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
}

// get batch list.
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

        // pagination
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * pageSize;

        // Sorting
        const sortBy = req.query.sortBy || "createdAt";
        const sortOrder = req.query.sort === "asc" ? 1 : -1;

        const sorting = { [sortBy]: sortOrder };

        // Filters
        const baseQuery = { isDeleted: false };

        if (req.query.instituteCourseId)
            baseQuery.instituteCourseId = req.query.instituteCourseId;

        if (req.query.instituteSubCourseId)
            baseQuery.instituteSubCourseId = req.query.instituteSubCourseId;

        const [rawBatches, totalRecords] = await Promise.all([

            InstituteBatchesModel.find(baseQuery)
                .sort(sorting)
                .skip(skip)
                .limit(pageSize)
                .populate({ path: 'instituteCourseId', select: 'name' })
                .populate({ path: 'instituteSubCourseId', select: 'name' })
                .lean(),

            InstituteBatchesModel.countDocuments(baseQuery)
        ]);

        const today = new Date();

        let filtered = rawBatches;

        if (req.query.type) {
            const typeLower = req.query.type.toLowerCase();

            filtered = rawBatches.filter((b) => {

                if (!start || !end) return false;

                const isCompleted = end < today;
                const isUpcoming = start > today;
                const isOngoing = start <= today && today <= end;

                if (typeLower === "completed") return isCompleted;
                if (typeLower === "upcoming") return isUpcoming;
                if (typeLower === "ongoing") return isOngoing;

                return true;
            });
        }

        // Response
        const batches = filtered.map((item) => ({
            _id: item._id,
            batchName: item.batchName,

            course: item.instituteCourseId ? {
                _id: item.instituteCourseId._id,
                name: item.instituteCourseId.name
            } : null,

            subCourse: item.instituteSubCourseId ? {
                _id: item.instituteSubCourseId._id,
                name: item.instituteSubCourseId.name
            } : null,

            shift: item.shift,
            startDate: item.startDate,
            endDate: item.endDate,
            startTime: item.startTime,
            endTime: item.endTime,
            registrationEndDate: item.registrationEndDate,
            orientationDate: item.orientationDate,

            batchSize: item.batchSize || 0,
            slug: item.slug
        }));

        return res.status(200).send(
            response.toJson(messages['en'].common.list_success, {
                batches,
                total: totalRecords,
                currentPage: page,
                totalPages: Math.ceil(totalRecords / pageSize)
            })
        );

    } catch (err) {
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
            batchSize: batch.batchSize || 0,
            appAccessExpireDays: batch.appAccessExpireDays || 0,

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
    } catch (err) {
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
    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

// get global module _id & name list for dropdown, based on course and sub course
const moduleDropdownList = async (req, res) => {
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

        if (req.query.instituteSubCourseId) {
            baseQuery.instituteSubCourseId = req.query.instituteSubCourseId;
        }

        const modules = await InstituteModulesModel
            .find(baseQuery, { _id: 1, name: 1 })
            .lean();

        return res.status(200).send(
            response.toJson(
                messages['en'].common.list_success,
                { modules }
            )
        );

    } catch (err) {
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
    } catch (err) {
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

        // pagination
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * pageSize;

        // Sorting
        const sortBy = req.query.sortBy || "createdAt";
        const sortOrder = req.query.sort === "asc" ? 1 : -1;
        const sorting = { [sortBy]: sortOrder };

        // Filters
        const baseQuery = { isDeleted: false };

        if (req.query.instituteCourseId)
            baseQuery.instituteCourseId = req.query.instituteCourseId;

        if (req.query.instituteSubCourseId)
            baseQuery.instituteSubCourseId = req.query.instituteSubCourseId;

        if (req.query.moduleNumber)
            baseQuery.moduleNumber = req.query.moduleNumber;

        if (req.query.status)
            baseQuery.status = req.query.status;

        if (req.query.createdBy)
            baseQuery.createdBy = req.query.createdBy;

        if (req.query.search) {
            baseQuery.$or = [
                { name: { $regex: req.query.search, $options: "i" } },
                { coordinator: { $regex: req.query.search, $options: "i" } }
            ];
        }

        // QUERY
        const [modules, totalRecords] = await Promise.all([

            InstituteModulesModel.find(baseQuery)
                .select('-createdAt -updatedAt -__v')
                .populate("instituteCourseId", "name")
                .populate("instituteSubCourseId", "name")
                .sort(sorting)
                .skip(skip)
                .limit(pageSize)
                .lean(),

            InstituteModulesModel.countDocuments(baseQuery)
        ]);

        // Response
        const formattedModules = modules.map(item => ({
            _id: item._id,
            name: item.name,
            moduleNumber: item.moduleNumber,
            description: item.description,
            outcome: item.feedback,
            coordinator: item.coordinator,
            status: item.status,

            course: item.instituteCourseId ? {
                _id: item.instituteCourseId._id,
                name: item.instituteCourseId.name
            } : null,

            subCourse: item.instituteSubCourseId ? {
                _id: item.instituteSubCourseId._id,
                name: item.instituteSubCourseId.name
            } : null
        }));

        return res.status(200).send(
            response.toJson(messages['en'].common.list_success, {
                modules: formattedModules,
                total: totalRecords,
                currentPage: page,
                totalPages: Math.ceil(totalRecords / pageSize)
            })
        );

    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

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
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
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
    } catch (err) {
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

        // Search (regex based – safer than $text if text index not configured)
        if (req.query.search) {
            filters.$or = [
                { firstName: { $regex: req.query.search, $options: "i" } },
                { lastName: { $regex: req.query.search, $options: "i" } },
                { prefixName: { $regex: req.query.search, $options: "i" } }
            ];
        }

        // Fetch Experts
        const experts = await expertsModel.Experts.find(
            filters,
            {
                _id: 1,
                prefixName: 1,
                firstName: 1,
                lastName: 1
            }
        )
            .sort({ firstName: 1 })
            .lean();

        // Full Name Format 
        const formattedExperts = experts.map(expert => {

            const fullName = [
                expert.prefixName,
                expert.firstName,
                expert.lastName
            ]
                .filter(Boolean)
                .join(" ");

            return {
                _id: expert._id,
                name: fullName
            };
        });

        // Response
        return res.status(200).send(
            response.toJson(
                messages['en'].common.list_success,
                { experts: formattedExperts }
            )
        );

    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
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
            // ensure lectureDate is strictly after batch end date
            if (lectureDate && batch.endDate) {
                const lec = new Date(lectureDate);
                if (lec <= new Date(batch.endDate)) {
                    return res.status(400).send(
                        response.toJson(messages['en'].instituteCourse.lecture_date_after_batch_end)
                    );
                }
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
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
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
            // validate provided lectureDate is after batch end date
            if (lectureDate && batch.endDate) {
                const lec = new Date(lectureDate);
                if (lec <= new Date(batch.endDate)) {
                    return res.status(400).send(
                        response.toJson(messages['en'].instituteCourse.lecture_date_after_batch_end)
                    );
                }
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
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
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

        // filters
        const filters = { isDeleted: false };
        if (req.query.instituteCourseId) filters.courseId = req.query.instituteCourseId;
        if (req.query.instituteSubCourseId) filters.subCourseId = req.query.instituteSubCourseId;
        if (req.query.batchId) filters.batchId = req.query.batchId;
        if (req.query.expertId) filters.expertId = req.query.expertId;

        if (req.query.search) {
            filters.classroomNumber = {
                $regex: req.query.search,
                $options: "i"
            };
        }

        // pagination
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * pageSize;

        // sorting
        const sortBy = req.query.sortBy || "lectureDate";
        const sortOrder = req.query.sort === "asc" ? 1 : -1;
        const sorting = { [sortBy]: sortOrder };

        // query with pagination
        const [lectures, total] = await Promise.all([
            InstituteLectures.find(filters)
                .populate("courseId", "name")
                .populate("subCourseId", "name")
                .populate("batchId", "batchName")
                .populate("expertId", "prefixName firstName lastName")
                .sort(sorting)
                .skip(skip)
                .limit(pageSize)
                .lean(),
            InstituteLectures.countDocuments(filters)
        ]);

        const formattedLectures = lectures.map((lecture) => ({
            _id: lecture._id,

            course: lecture.courseId ? {
                _id: lecture.courseId._id,
                name: lecture.courseId.name
            } : null,

            subCourse: lecture.subCourseId ? {
                _id: lecture.subCourseId._id,
                name: lecture.subCourseId.name
            } : null,

            batch: lecture.batchId ? {
                _id: lecture.batchId._id,
                name: lecture.batchId.batchName
            } : null,

            expert: lecture.expertId ? {
                _id: lecture.expertId._id,
                name: `${lecture.expertId.prefixName}. ${lecture.expertId.firstName} ${lecture.expertId.lastName}`
            } : null,

            classroomNumber: lecture.classroomNumber,
            lectureDate: lecture.lectureDate,
            lectureType: lecture.lectureType,
            projectReviewLecture: lecture.projectReviewLecture,
            sessionStartTime: lecture.sessionStartTime,
            sessionEndTime: lecture.sessionEndTime,
            material: lecture.material,
            createFeedbackForLearner: lecture.createFeedbackForLearner,
            feedbackForCoordinator: lecture.feedbackForCoordinator,
            status: lecture.status,
            createdAt: lecture.createdAt,
            updatedAt: lecture.updatedAt
        }));

        return res.status(200).send(
            response.toJson(
                messages['en'].common.list_success,
                {
                    lectures: formattedLectures,
                    total,
                    currentPage: page,
                    totalPages: Math.ceil(total / pageSize)
                }
            )
        );

    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
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
            .populate("expertId", "prefixName firstName lastName")
            .lean();
        if (!lecture) {
            return res.status(404).send(
                response.toJson(messages['en'].instituteCourse.lecture_not_exist)
            );
        }
        const formattedResponse = {
            _id: lecture._id,

            course: lecture.courseId ? {
                _id: lecture.courseId._id,
                name: lecture.courseId.name
            } : null,

            subCourse: lecture.subCourseId ? {
                _id: lecture.subCourseId._id,
                name: lecture.subCourseId.name
            } : null,

            batch: lecture.batchId ? {
                _id: lecture.batchId._id,
                name: lecture.batchId.batchName
            } : null,

            expert: lecture.expertId ? {
                _id: lecture.expertId._id,
                name: `${lecture.expertId.prefixName}. ${lecture.expertId.firstName} ${lecture.expertId.lastName}`
            } : null,

            classroomNumber: lecture.classroomNumber,
            lectureDate: lecture.lectureDate,
            lectureType: lecture.lectureType,
            projectReviewLecture: lecture.projectReviewLecture,
            sessionStartTime: lecture.sessionStartTime,
            sessionEndTime: lecture.sessionEndTime,
            material: lecture.material,
            createFeedbackForLearner: lecture.createFeedbackForLearner,
            feedbackForCoordinator: lecture.feedbackForCoordinator,
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
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
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
    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
}

// change status of course, and cascade the status to all related entities (sub-course, batch, module, lecture, student) if course is inactivated
const updateStatus = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(response.toJson(errors.errors[0].msg));
    }

    const { courseId } = req.params;
    const { status } = req.body; // 'ACTIVE' or 'INACTIVE'

    try {
        // Check if course exists
        const course = await InstituteCoursesModel.findById(courseId);
        if (!course) {
            return res.status(404).send(response.toJson(messages['en'].instituteCourse.course_not_exist));
        }

        // Update the main Course status
        await InstituteCoursesModel.findByIdAndUpdate(courseId, {
            status,
            updatedAt: new Date()
        });

        // If status is INACTIVE, cascade to all child entities
        if (status === 'INACTIVE') {
            const query = { instituteCourseId: courseId };
            const lectureQuery = { courseId: courseId };
            const studentQuery = { CourseId: courseId };

            await Promise.all([
                // Update Sub-Courses
                InstituteSubCoursesModel.updateMany(query, { status: 'INACTIVE' }),

                // Update Batches
                InstituteBatchesModel.updateMany(query, { status: 'INACTIVE' }),

                // Update Modules
                InstituteModulesModel.updateMany(query, { status: 'INACTIVE' }),

                // Update Lectures
                InstituteLectures.updateMany(lectureQuery, { status: 'INACTIVE' }),

                // Update Students
                InstituteStudentsModel.updateMany(studentQuery, { status: 'INACTIVE' })
            ]);
        }

        return res.status(200).send(
            response.toJson(messages['en'].common.update_success, {
                message: `Course and related entities marked as ${status}`
            })
        );

    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

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
    moduleDropdownList,
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
    deleteLecture,
    updateStatus
}