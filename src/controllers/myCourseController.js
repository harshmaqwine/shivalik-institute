const messages = require("../message/index.js");
const response = require("../config/response.js");
const { validationResult } = require('express-validator');
const CommonConfig = require('../config/common.js');
const CommonFun = require('../libs/common.js');
const InstituteStudentsModel = require('../models/instituteStudents.js');
const InstituteCoursesModel = require('../models/instituteCourses.js');
const InstituteSubCoursesModel = require('../models/instituteSubCourses.js');
const InstituteBatchesModel = require('../models/instituteBatches.js');
const { InstituteLectures } = require('../models/instituteLectures.js'); 

// get my courses list for student
const myCoursesList = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(response.toJson(errors.errors[0].msg));
    }

    try {
        const { countryCode, countryCodeName, phone } = req.body;

        // pagination
        const page = parseInt(req.query.page, 10) || 1;
        const pageSize = CommonConfig.instituteCourseListLimit || 10;

        const studentFilter = {
            countryCode: (countryCode || '').toString().trim(),
            countryCodeName: (countryCodeName || '').toString().trim(),
            phone: (phone || '').toString().trim(),
            isDeleted: false
        };

        // Find unique course IDs for the matching student(s)
        const courseIds = await InstituteStudentsModel.distinct('CourseId', studentFilter);

        if (!courseIds || courseIds.length === 0) {
            return res.status(404).send(response.toJson(messages['en'].instituteStudent.not_exists));
        }

        const total = courseIds.length;
        const totalPages = Math.ceil(total / pageSize);
        const skip = (page - 1) * pageSize;

        const pagedCourseIds = courseIds.slice(skip, skip + pageSize);

        const coursesRaw = await InstituteCoursesModel.find({
            _id: { $in: pagedCourseIds },
            isDeleted: false
        })
            .select('name price discount status')
            .lean();

        // Preserve the order of the pagedCourseIds
        const courseMap = new Map(coursesRaw.map(c => [String(c._id), c]));
        const courses = pagedCourseIds
            .map(id => courseMap.get(String(id)))
            .filter(Boolean);

        return res.status(200).send(response.toJson(messages['en'].common.list_success, {
            courses,
            total,
            currentPage: page,
            totalPages
        }));
    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

// get my sub courses list for student 
const mySubCoursesList = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(response.toJson(errors.errors[0].msg));
    }

    try {
        const { countryCode, countryCodeName, phone } = req.body;
        // pagination   
        const page = parseInt(req.query.page, 10) || 1;
        const pageSize = CommonConfig.instituteCourseListLimit || 10;
        const studentFilter = {
            countryCode: (countryCode || '').toString().trim(),
            countryCodeName: (countryCodeName || '').toString().trim(),
            phone: (phone || '').toString().trim(),
            isDeleted: false
        };
        const subCourseIds = await InstituteStudentsModel.distinct('subCourseId', studentFilter);
        if (!subCourseIds || subCourseIds.length === 0) {
            return res.status(404).send(response.toJson(messages['en'].instituteStudent.not_exists));
        }
        // Fetch all matching sub-courses for the student (deduped by distinct())
        const subCoursesRaw = await InstituteSubCoursesModel.find({
            _id: { $in: subCourseIds },
            isDeleted: false,
            status: 'ACTIVE'
        })
            .select('name price discount status')
            .lean();

        // Preserve the order of the original distinct IDs and filter out missing/deleted ones
        const subCourseMap = new Map(subCoursesRaw.map(c => [String(c._id), c]));
        const orderedSubCourses = subCourseIds
            .map(id => subCourseMap.get(String(id)))
            .filter(Boolean);

        const total = orderedSubCourses.length;
        const totalPages = Math.ceil(total / pageSize);
        const skip = (page - 1) * pageSize;
        const subCourses = orderedSubCourses.slice(skip, skip + pageSize);

        return res.status(200).send(response.toJson(messages['en'].common.list_success, {
            subCourses,
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

// get my batches list for student
const myBatchesList = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(response.toJson(errors.errors[0].msg));
    }

    try {
        const { countryCode, countryCodeName, phone } = req.body;
        // pagination
        const page = parseInt(req.query.page, 10) || 1;
        const pageSize = CommonConfig.instituteCourseListLimit || 10;
        const studentFilter = {
            countryCode: (countryCode || '').toString().trim(),
            countryCodeName: (countryCodeName || '').toString().trim(),
            phone: (phone || '').toString().trim(),
            isDeleted: false
        };
        const batchIds = await InstituteStudentsModel.distinct('batchId', studentFilter);
        if (!batchIds || batchIds.length === 0) {
            return res.status(404).send(response.toJson(messages['en'].instituteStudent.not_exists));
        }
        const total = batchIds.length;
        const totalPages = Math.ceil(total / pageSize);
        const skip = (page - 1) * pageSize;
        const pagedBatchIds = batchIds.slice(skip, skip + pageSize);
        const batchesRaw = await InstituteBatchesModel.find({
            _id: { $in: pagedBatchIds },
            isDeleted: false
        })
            .select('batchName startDate endDate status')
            .lean();

        const batches = batchesRaw.map(b => ({
            _id: b._id,
            name: b.batchName,
            startDate: b.startDate,
            endDate: b.endDate,
            status: b.status
        }));

        return res.status(200).send(response.toJson(messages['en'].common.list_success, {
            batches,
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

// get my Lecture List api for student 
const myLectureList = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(response.toJson(errors.errors[0].msg));
    }

    try {
        const { countryCode, countryCodeName, phone, type = 'all', instituteCourseId, instituteSubCourseId, batchId } = req.body;
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
        if (type === 'upcoming') {
            lectureFilter.lectureDate = { $gte: new Date() };
        }
        if (allowedSubCourseIds && allowedSubCourseIds.length > 0) {
            lectureFilter.subCourseId = { $in: allowedSubCourseIds };
        }
        if (allowedBatchIds && allowedBatchIds.length > 0) {
            lectureFilter.batchId = { $in: allowedBatchIds };
        }

        const lecturesRaw = await InstituteLectures.find(lectureFilter)
            .select('classroomNumber lectureDate lectureType sessionStartTime sessionEndTime material status courseId subCourseId batchId')
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

        const formattedLectures = lecturesRaw.map(l => ({
            _id: l._id,
            classroomNumber: l.classroomNumber,
            lectureDate: l.lectureDate,
            lectureType: l.lectureType,
            sessionStartTime: l.sessionStartTime,
            sessionEndTime: l.sessionEndTime,
            material: l.material,
            status: l.status,
            course: l.courseId ? { _id: l.courseId._id, name: l.courseId.name } : null,
            subCourse: l.subCourseId ? { _id: l.subCourseId._id, name: l.subCourseId.name } : null,
            batch: l.batchId ? { _id: l.batchId._id, name: l.batchId.batchName } : null,
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

// Other Courses api(not included my course)
const otherCoursesList = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(response.toJson(errors.errors[0].msg));
    }

    try {
        const { countryCode, countryCodeName, phone } = req.body;
        // pagination
        const page = parseInt(req.query.page, 10) || 1;
        const pageSize = CommonConfig.instituteCourseListLimit || 10;
        const studentFilter = {
            countryCode: (countryCode || '').toString().trim(),
            countryCodeName: (countryCodeName || '').toString().trim(),
            phone: (phone || '').toString().trim(),
            isDeleted: false
        };
        const myCourseIds = await InstituteStudentsModel.distinct('CourseId', studentFilter);
        const otherCoursesRaw = await InstituteCoursesModel.find({
            _id: { $nin: myCourseIds },
            status: 'ACTIVE',
            isDeleted: false
        })
            .select('name price discount status')
            .lean();
        const total = otherCoursesRaw.length;
        const totalPages = Math.ceil(total / pageSize);
        const skip = (page - 1) * pageSize;
        const otherCourses = otherCoursesRaw.slice(skip, skip + pageSize);
        return res.status(200).send(response.toJson(messages['en'].common.list_success, {
            otherCourses,
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
    myCoursesList,
    mySubCoursesList,
    myBatchesList,
    myLectureList, 
    otherCoursesList,
};
