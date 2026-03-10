const e = require("express");
const { check, query, param } = require("express-validator");

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
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive number')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Limit must be a positive number')
    .toInt(),

  query('sortBy')
    .optional()
    .isIn(['name', 'price', 'discount', 'status', 'createdAt'])
    .withMessage('Invalid sortBy field'),

  query('sort')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort must be asc or desc'),

  query('instituteCourseId')
    .optional()
    .isMongoId()
    .withMessage('Invalid instituteCourseId'),

  query('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE'])
    .withMessage('Invalid status value'),

  query('search')
    .optional()
    .isString()
    .trim()
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

  // Format YYYY-MM-DD needed & registrationEndDate should NOT be after startDate
  check('registrationEndDate')
    .not().isEmpty().withMessage('Registration End Date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Registration End Date must be in format YYYY-MM-DD')
    .custom((registrationEndDate, { req }) => {
      if (req.body.startDate && new Date(registrationEndDate) > new Date(req.body.startDate)) {
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
  // optional integer days for app access expiry after batch complete
  check('appAccessExpireDays').optional().isInt({ min: 0 }).withMessage('App Access Expire Days must be a non-negative integer'),
  // optional batch size
  check('batchSize').optional().isInt({ min: 0 }).withMessage('Batch Size must be a non-negative integer'),
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

  // Format YYYY-MM-DD needed & registrationEndDate should NOT come after startDate
  check('registrationEndDate')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Registration End Date must be in format YYYY-MM-DD')
    .custom((registrationEndDate, { req }) => {
      if (req.body.startDate && new Date(registrationEndDate) > new Date(req.body.startDate)) {
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
  // optional integer days for app access expiry after batch complete
  check('appAccessExpireDays').optional().isInt({ min: 0 }).withMessage('App Access Expire Days must be a non-negative integer'),
];

exports.batchDelete = [
  check('batchId').not().isEmpty().withMessage('Batch id is required'),
];

exports.batchList = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive number')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Limit must be a positive number')
    .toInt(),

  query('instituteCourseId')
    .optional()
    .isMongoId()
    .withMessage('Invalid instituteCourseId'),

  query('instituteSubCourseId')
    .optional()
    .isMongoId()
    .withMessage('Invalid instituteSubCourseId')
    .custom((value, { req }) => {
      if (value && !req.query.instituteCourseId) {
        throw new Error('instituteCourseId is required when instituteSubCourseId is provided');
      }
      return true;
    }),

  query('sortBy')
    .optional()
    .isIn(['batchName', 'startDate', 'createdAt'])
    .withMessage('Invalid sortBy field'),

  query('sort')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort must be asc or desc')

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

exports.moduleDropdownList = [

  query('instituteCourseId')
    .notEmpty()
    .withMessage('Institute Course id is required')
    .isMongoId()
    .withMessage('Invalid Institute Course id'),

  query('instituteSubCourseId')
    .optional()
    .isMongoId()
    .withMessage('Invalid Institute Sub Course id'),

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
    .isString().withMessage('added module number')
    .trim()
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
    .isString().withMessage('added module number')
    .trim()
    .toInt(),
  check('name').optional(),
  check('description').optional(),
  check('materialLink').optional(),
];

exports.deleteModule = [
  check('moduleId').not().isEmpty().withMessage('Module id is required'),
];

exports.listModule = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive number')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Limit must be a positive number')
    .toInt(),

  query('sortBy')
    .optional()
    .isIn(['name', 'moduleNumber', 'status', 'createdAt'])
    .withMessage('Invalid sortBy field'),

  query('sort')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort must be asc or desc'),

  query('instituteCourseId')
    .optional()
    .isMongoId()
    .withMessage('Invalid instituteCourseId'),

  query('instituteSubCourseId')
    .optional()
    .isMongoId()
    .withMessage('Invalid instituteSubCourseId'),

  query('moduleNumber')
    .optional()
    .isInt()
    .withMessage('Module number')
    .toInt(),

  query('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE'])
    .withMessage('Status must be ACTIVE or INACTIVE'),

  query('createdBy')
    .optional()
    .isMongoId()
    .withMessage('Invalid createdBy user id'),

  query('search')
    .optional()
    .isString()
    .trim()
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
  // pagination
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive number')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Limit must be a positive number')
    .toInt(),

  // sorting
  query('sortBy').optional(),
  query('sort')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort must be asc or desc'),

  // filters
  query('instituteCourseId')
    .optional()
    .isMongoId()
    .withMessage('Invalid instituteCourseId'),
  query('instituteSubCourseId')
    .optional()
    .isMongoId()
    .withMessage('Invalid instituteSubCourseId'),
  query('batchId')
    .optional()
    .isMongoId()
    .withMessage('Invalid batchId'),
  query('expertId')
    .optional()
    .isMongoId()
    .withMessage('Invalid expertId'),
  query('classroomNumber').optional().isString(),
  query('lectureDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid lecture date format'),
  query('lectureType').optional(),

  // search term
  query('search')
    .optional()
    .isString()
    .trim(),

  query('createFeedbackForLearner')
    .optional()
    .isBoolean()
    .withMessage('createFeedbackForLearner must be a boolean'),
  query('feedbackForCoordinator').optional(),
];

exports.lectureDetails = [
  check('lectureId').not().isEmpty().withMessage('Lecture id is required'),
];

exports.updateStatus = [
  param('courseId').isMongoId().withMessage('Invalid Course ID'),
  check('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['ACTIVE', 'INACTIVE']).withMessage('Status must be ACTIVE or INACTIVE'),
];