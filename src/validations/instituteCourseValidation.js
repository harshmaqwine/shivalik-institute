const e = require("express");
const { check } = require("express-validator");

exports.create = [
  check('name').not().isEmpty().withMessage('Name is requied'),
  check('price').optional(),
  check('discount').optional(),
];

exports.updateCourse = [
  check('name')
    .optional()
    .isString()
    .withMessage('Course name must be a string'),
  check('price')
    .optional()
    .isNumeric()
    .withMessage('Price must be a number'),
  check('discount')
    .optional()
    .isNumeric()
    .withMessage('Discount must be a number'),
];

exports.deleteCourse = [
  check('courseId').not().isEmpty().withMessage('Course id is requied'),
];

exports.subCourseCreate = [
  check('instituteCourseId').not().isEmpty().withMessage('Institute Course id is requied'),
  check('name').not().isEmpty().withMessage('Name is requied'),
  check('price').optional(),
  check('discount').optional(),
];

exports.subCourseUpdate = [
  check('subCourseId').not().isEmpty().withMessage('Sub Course id is requied'),
  check('instituteCourseId').not().isEmpty().withMessage('Institute Course id is requied'),
  check('name')
    .optional()
    .isString()
    .withMessage('Sub Course name must be a string'),
  check('price')
    .optional()
    .isNumeric()
    .withMessage('Price must be a number'),
  check('discount')
    .optional()
    .isNumeric()
    .withMessage('Discount must be a number'),
];

exports.subCourseDelete = [
  check('subCourseId').not().isEmpty().withMessage('Sub Course id is requied'),
];

exports.subCourseList = [
  check('page').not().isEmpty().withMessage('Page is requied').toInt().withMessage('Page is allowed Only numbers'),
  check('sortBy').optional(),
  check('sort').optional(),
  check('instituteCourseId').optional(),
];

exports.list = [
  check('page').not().isEmpty().withMessage('Page is requied').toInt().withMessage('Page is allowed Only numbers'),
  check('sortBy').optional(),
  check('sort').optional(),
];

exports.details = [
  check('courseId').not().isEmpty().withMessage('Course id is requied'),
];

exports.subCourseDetails = [
  check('subCourseId').not().isEmpty().withMessage('Sub Course id is requied'),
];

exports.publicList = [
  check('page').not().isEmpty().withMessage('Page is requied').toInt().withMessage('Page is allowed Only numbers'),
  check('sortBy').optional(),
  check('sort').optional(),
];

exports.subCourcePublicList = [
  check('page').not().isEmpty().withMessage('Page is requied').toInt().withMessage('Page is allowed Only numbers'),
  check('sortBy').optional(),
  check('sort').optional(),
  check('instituteCourseId').optional(),
];

exports.batchPublicList = [
  check('page').not().isEmpty().withMessage('Page is requied').toInt().withMessage('Page is allowed Only numbers'),
  check('sortBy').optional(),
  check('sort').optional(),
  check('instituteCourseId').optional(),
  check('instituteSubCourseId').optional(),
];

// institute batches
exports.batchCreate = [
  check('instituteCourseId').not().isEmpty().withMessage('Institute Course id is requied'),
  check('instituteSubCourseId').optional(),
  check('batchName').not().isEmpty().withMessage('Batch Name is requied'),
  check('startTime').not().isEmpty().withMessage('Start Time is requied')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage("Start Time must be in HH:MM 24-hour format"),
  check('endTime').not().isEmpty().withMessage('End Time is requied')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage("End Time must be in HH:MM 24-hour format"),

  check('shift').not().isEmpty().withMessage('Shift is requied'),
  // check('orientationDate').optional().matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}$/).withMessage('Invalid date format. Use ISO 8601 (YYYY-MM-DDTHH:mm:ss.SSSZ)'),
  check('orientationDate').not().isEmpty().withMessage('Orientation Date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Orientation Date must be in format YYYY-MM-DD'),

  // Format YYYY-MM-DD needed & Registration end date must be on or before start date
  check('registrationEndDate')
    .not().isEmpty().withMessage('Registration End Date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Registration End Date must be in format YYYY-MM-DD')
    .custom((registrationEndDate, { req }) => {
      if (req.body.startDate && new Date(registrationEndDate) < new Date(req.body.startDate)) {
        throw new Error("Registration end date must be on or before start date");
      }
      return true;
    }),

  // Format YYYY-MM-DD needed
  check('startDate')
    .not().isEmpty().withMessage('Start Date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Start Date must be in format YYYY-MM-DD'),

  // Format YYYY-MM-DD needed & End Date must be on or after Start Date
  check('endDate')
    .not().isEmpty().withMessage('End Date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('End Date must be in format YYYY-MM-DD')
    .custom((endDate, { req }) => {
      if (req.body.startDate && new Date(endDate) < new Date(req.body.startDate)) {
        throw new Error('End Date must be on or after Start Date');
      }
      return true;
    }),
];

exports.batchUpdate = [
  check('batchId').not().isEmpty().withMessage('Batch id is requied'),
  check('instituteCourseId').not().isEmpty().withMessage('Institute Course id is requied'),
  check('instituteSubCourseId').optional(),
  check('startTime').optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage("Start Time must be in HH:MM 24-hour format"),
  check('endTime').optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage("End Time must be in HH:MM 24-hour format"),

  check('shift').optional(),

  // check('orientationDate').optional().matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}$/).withMessage('Invalid date format. Use ISO 8601 (YYYY-MM-DDTHH:mm:ss.SSSZ)'),
  check('orientationDate').not().isEmpty().withMessage('Orientation Date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Orientation Date must be in format YYYY-MM-DD'),

  // Format YYYY-MM-DD needed & Registration end date must be on or before start date
  check('registrationEndDate')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Registration End Date must be in format YYYY-MM-DD')
    .custom((registrationEndDate, { req }) => {
      if (req.body.startDate && new Date(registrationEndDate) < new Date(req.body.startDate)) {
        throw new Error("Registration end date must be on or before start date");
      }
      return true;
    }),

  // Format YYYY-MM-DD needed
  check('startDate')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Start Date must be in format YYYY-MM-DD'),

  // Format YYYY-MM-DD needed & End Date must be on or after Start Date
  check('endDate')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('End Date must be in format YYYY-MM-DD')
    .custom((endDate, { req }) => {
      if (req.body.startDate && new Date(endDate) < new Date(req.body.startDate)) {
        throw new Error('End Date must be on or after Start Date');
      }
      return true;
    }),
];

exports.batchDelete = [
  check('batchId').not().isEmpty().withMessage('Batch id is required'),
];

exports.batchList = [
  check('page').not().isEmpty().withMessage('Page is required').toInt().withMessage('Page is allowed Only numbers'),
  check('type').optional().isIn(['UPCOMING', 'ONGOING', 'COMPLETED']).withMessage('Type must be one of the following: UPCOMING, ONGOING, COMPLETED'),
  check('instituteCourseId').optional(),
  check('instituteSubCourseId')
    .optional()
    .custom((value, { req }) => {
      if (value && !req.body.instituteCourseId && !req.query.instituteCourseId) {
        throw new Error('instituteCourseId is required');
      }
      return true;
    }),
  check('sortBy').optional(),
  check('sort').optional(),
  check('pageSize').optional(),
];

exports.batchDetails = [
  check('batchId').not().isEmpty().withMessage('Batch id is required'),
];

exports.courseDropdownList = [
  // check('instituteId').not().isEmpty().withMessage('Institute id is requied'),
];

exports.batchDropdownList = [
  check('instituteCourseId').not().isEmpty().withMessage('Institute Course id is required'),
  check('instituteSubCourseId').optional(),
];

exports.subCourseDropdownList = [
  check('instituteCourseId').not().isEmpty().withMessage('Institute Course id is required'),
];

exports.createModule = [
  check('instituteCourseId')
    .notEmpty().withMessage('Institute Course id is required')
    .isMongoId().withMessage('Invalid Institute Course id'),

  check('instituteSubCourseId')
    .optional()
    .isMongoId().withMessage('Invalid Institute Sub Course id'),

  check('moduleNumber')
    .optional()
    .isInt().withMessage('Module number must be an integer') 
    .toInt(),

  check('name')
    .notEmpty().withMessage('Module name is required'),

  check('description').optional(),
  check('materialLink').optional(),
  check('feedback').optional(),
  check('coordinator').optional(),
];

exports.updateModule = [  
  check('moduleId').not().isEmpty().withMessage('Module id is required'),
  check('instituteCourseId').not().isEmpty().withMessage('Institute Course id is required'),
  check('instituteSubCourseId').optional(),
  check('moduleNumber')
    .optional()
    .isInt().withMessage('Module number must be an integer')
    .toInt(),
  check('name').optional(),
  check('description').optional(),
  check('materialLink').optional(),
];    

exports.deleteModule = [
  check('moduleId').not().isEmpty().withMessage('Module id is required'),
];

exports.listModule = [
  check('page').not().isEmpty().withMessage('Page is required').toInt().withMessage('Page is allowed Only numbers'),
  check('sortBy').optional(),
  check('sort').optional(),
  check('instituteCourseId').optional(),
  check('instituteSubCourseId').optional(),
  check('batchId').optional(),
  check('moduleNumber').optional().isInt().withMessage('Module number must be an integer').toInt(),
  check('name').optional(),
  check('coordinator').optional(),  
  check('status').optional().isIn(['ACTIVE', 'INACTIVE']).withMessage('Status must be either ACTIVE or INACTIVE'),
  check('createdBy').optional().isMongoId().withMessage('Invalid createdBy user id'),
  check('updatedBy').optional().isMongoId().withMessage('Invalid updatedBy user id'),
  check('createdAt').optional().isISO8601().withMessage('Invalid createdAt date format'),
  check('updatedAt').optional().isISO8601().withMessage('Invalid updatedAt date format'),
];

exports.moduleDetails = [
  check('moduleId').not().isEmpty().withMessage('Module id is required'),
];

exports.expertDropdownList = [ 
  check('name').optional(), 
  check('status').optional().isIn(['ACTIVE', 'INACTIVE']).withMessage('Status must be either ACTIVE or INACTIVE'),
];

exports.createLecture = [

  check('courseId')
    .notEmpty()
    .withMessage('Course id is required')
    .isMongoId()
    .withMessage('Invalid course id'),

  check('subCourseId')
    .optional()
    .isMongoId()
    .withMessage('Invalid sub course id'),

  check('batchId')
    .optional()
    .isMongoId()
    .withMessage('Invalid batch id'),

  check('expertId')
    .notEmpty()
    .withMessage('Expert id is required')
    .isMongoId()
    .withMessage('Invalid expert id'),

  check('classroomNumber')
    .notEmpty()
    .withMessage('Classroom number is required'),

  check('lectureDate')
    .notEmpty()
    .withMessage('Lecture date is required')
    .isISO8601()
    .withMessage('Invalid lecture date format'),

  check('lectureType')
    .notEmpty()
    .withMessage('Lecture type is required'),

  check('sessionStartTime')
    .notEmpty()
    .withMessage('Session start time is required'),

  check('sessionEndTime')
    .notEmpty()
    .withMessage('Session end time is required'),

  check('createFeedbackForLearner')
    .optional()
    .isBoolean()
    .withMessage('createFeedbackForLearner must be boolean'),

  check('feedbackForCoordinator')
    .optional()
];

exports.updateLecture = [

  check('lectureId')
    .notEmpty()
    .withMessage('Lecture id is required'),

  check('courseId')
    .optional()
    .isMongoId()
    .withMessage('Invalid course id'),

  check('subCourseId')
    .optional()
    .isMongoId()
    .withMessage('Invalid sub course id'),

  check('batchId')
    .optional()
    .isMongoId()
    .withMessage('Invalid batch id'),

  check('expertId')
    .optional()
    .isMongoId()
    .withMessage('Invalid expert id'),

  check('lectureDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid lecture date format'),

  check('sessionStartTime')
    .optional(),

  check('sessionEndTime')
    .optional(),

  check('createFeedbackForLearner')
    .optional()
    .isBoolean()
    .withMessage('createFeedbackForLearner must be boolean'),
];
exports.deleteLecture = [
  check('lectureId').not().isEmpty().withMessage('Lecture id is required'),
];

exports.listLecture = [
  check('page').not().isEmpty().withMessage('Page is required').toInt().withMessage('Page is allowed Only numbers'),
  check('sortBy').optional(),
  check('sort').optional(),
  check('instituteCourseId').optional(),
  check('instituteSubCourseId').optional(),
  check('expertId').optional(),
  check('classroomNumber').optional(),
  check('lectureDate').optional().isISO8601().withMessage('Invalid lecture date format'),
  check('lectureType').optional(),
  check('createFeedbackForLearner').optional().isBoolean().withMessage('createFeedbackForLearner must be a boolean'),
  check('feedbackForCoordinator').optional(),
];

exports.lectureDetails = [
  check('lectureId').not().isEmpty().withMessage('Lecture id is required'),
];