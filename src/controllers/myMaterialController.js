const messages = require("../message/index.js");
const response = require("../config/response.js");
const { validationResult } = require('express-validator');
const CommonConfig = require('../config/common.js');
const CommonFun = require('../libs/common.js');
const InstituteStudentsModel = require('../models/instituteStudents.js'); 
const { InstituteLectures } = require('../models/instituteLectures.js');
const { InstituteModulesModel } = require('../models/instituteModules.js');

// Module base material list api for student
const myMaterialList = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(response.toJson(errors.errors[0].msg));
    }
    try {
        const { countryCode, countryCodeName, phone, instituteCourseId, instituteSubCourseId } = req.body;
        // pagination
        const page = parseInt(req.query.page, 10) || 1;
        const pageSize = CommonConfig.instituteCourseListLimit || 10;
        const studentFilter = {
            countryCode: (countryCode || '').toString().trim(),
            countryCodeName: (countryCodeName || '').toString().trim(),
            phone: (phone || '').toString().trim(),
            isDeleted: false
        };

        // Validate student access to course/sub-course (based on registration data)
        const myCourseIds = await InstituteStudentsModel.distinct('CourseId', studentFilter);
        if (!myCourseIds || myCourseIds.length === 0) {
            return res.status(404).send(response.toJson(messages['en'].instituteStudent.not_exists));
        }

        const mySubCourseIds = await InstituteStudentsModel.distinct('subCourseId', studentFilter);

        const allowedCourseIds = instituteCourseId ? [instituteCourseId] : myCourseIds;
        if (instituteCourseId && !myCourseIds.map(String).includes(String(instituteCourseId))) {
            return res.status(404).send(response.toJson(messages['en'].instituteStudent.not_exists));
        }

        const allowedSubCourseIds = instituteSubCourseId ? [instituteSubCourseId] : mySubCourseIds;
        if (instituteSubCourseId && !mySubCourseIds.map(String).includes(String(instituteSubCourseId))) {
            return res.status(404).send(response.toJson(messages['en'].instituteStudent.not_exists));
        }

        const moduleFilter = {
            instituteCourseId: { $in: allowedCourseIds },
            isDeleted: false,
            status: 'ACTIVE'
        };
        if (allowedSubCourseIds && allowedSubCourseIds.length > 0) {
            moduleFilter.instituteSubCourseId = { $in: allowedSubCourseIds };
        }

        const materialsRaw = await InstituteModulesModel.find(moduleFilter)
            .select('moduleNumber name materialLink status instituteCourseId instituteSubCourseId')
            .populate({
                path: 'instituteCourseId',
                select: 'name'
            })
            .populate({
                path: 'instituteSubCourseId',
                select: 'name'
            })
            .lean();

        const formattedMaterials = materialsRaw.map(m => ({
            _id: m._id,
            moduleNumber: m.moduleNumber,
            name: m.name,
            materialLink: m.materialLink,
            status: m.status,
            course: m.instituteCourseId ? { _id: m.instituteCourseId._id, name: m.instituteCourseId.name } : null,
            subCourse: m.instituteSubCourseId ? { _id: m.instituteSubCourseId._id, name: m.instituteSubCourseId.name } : null,
        }));

        const total = formattedMaterials.length;
        const totalPages = Math.ceil(total / pageSize);
        const skip = (page - 1) * pageSize;
        const materials = formattedMaterials.slice(skip, skip + pageSize);

        return res.status(200).send(response.toJson(messages['en'].common.list_success, {
            materials,
            total,
            currentPage: page,
            totalPages
        }));
    }
    catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

// Lecture base material list api for student
const myLectureMaterialList = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(response.toJson(errors.errors[0].msg));
    }
    try {
        const { countryCode, countryCodeName, phone, instituteCourseId, instituteSubCourseId, batchId } = req.body;
        // pagination
        const page = parseInt(req.query.page, 10) || 1;
        const pageSize = CommonConfig.instituteCourseListLimit || 10;
        const studentFilter = {
            countryCode: (countryCode || '').toString().trim(),
            countryCodeName: (countryCodeName || '').toString().trim(),
            phone: (phone || '').toString().trim(),
            isDeleted: false
        };

        // Validate student access to course/sub-course/batch (based on registration data)
        const myCourseIds = await InstituteStudentsModel.distinct('CourseId', studentFilter);
        if (!myCourseIds || myCourseIds.length === 0) {
            return res.status(404).send(response.toJson(messages['en'].instituteStudent.not_exists));
        }

        const mySubCourseIds = await InstituteStudentsModel.distinct('subCourseId', studentFilter);
        const myBatchIds = await InstituteStudentsModel.distinct('batchId', studentFilter);

        if (instituteCourseId && !myCourseIds.map(String).includes(String(instituteCourseId))) {
            return res.status(404).send(response.toJson(messages['en'].instituteStudent.not_exists));
        }
        if (instituteSubCourseId && !mySubCourseIds.map(String).includes(String(instituteSubCourseId))) {
            return res.status(404).send(response.toJson(messages['en'].instituteStudent.not_exists));
        }
        if (batchId && !myBatchIds.map(String).includes(String(batchId))) {
            return res.status(404).send(response.toJson(messages['en'].instituteStudent.not_exists));
        }

        const allowedCourseIds = instituteCourseId ? [instituteCourseId] : myCourseIds;
        const allowedSubCourseIds = instituteSubCourseId ? [instituteSubCourseId] : mySubCourseIds;
        const allowedBatchIds = batchId ? [batchId] : myBatchIds;

        const lectureFilter = {
            courseId: { $in: allowedCourseIds },
            isDeleted: false,
            status: 'ACTIVE'
        };
        if (allowedSubCourseIds && allowedSubCourseIds.length > 0) {
            lectureFilter.subCourseId = { $in: allowedSubCourseIds };
        }
        if (allowedBatchIds && allowedBatchIds.length > 0) {
            lectureFilter.batchId = { $in: allowedBatchIds };
        }

        const lecturesRaw = await InstituteLectures.find(lectureFilter)
            .select('classroomNumber lectureDate lectureType material status courseId subCourseId batchId')
            .populate({
                path: 'courseId',
                select: '_id name'
            })
            .populate({
                path: 'subCourseId',
                select: '_id name'
            })
            .populate({
                path: 'batchId',
                select: '_id batchName'
            })
            .lean();

        const formattedLectures = lecturesRaw.map(m => ({
            _id: m._id,
            classroomNumber: m.classroomNumber,
            lectureDate: m.lectureDate,
            lectureType: m.lectureType,
            material: m.material,
            status: m.status,
            course: m.courseId ? { _id: m.courseId._id, name: m.courseId.name } : null,
            subCourse: m.subCourseId ? { _id: m.subCourseId._id, name: m.subCourseId.name } : null,
            batch: m.batchId ? { _id: m.batchId._id, name: m.batchId.batchName } : null,
        }));

        const total = formattedLectures.length;
        const totalPages = Math.ceil(total / pageSize);
        const skip = (page - 1) * pageSize;
        const lectures = formattedLectures.slice(skip, skip + pageSize);
        return res.status(200).send(response.toJson(messages['en'].common.list_success, {
            lectures,
            total,
            currentPage: page,
            totalPages
        }));
    }
    catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

module.exports = { 
    myMaterialList,
    myLectureMaterialList
};