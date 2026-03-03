const express = require('express');
const router = express.Router();

const instituteCoursesRoutes = require('./instituteCoursesRoutes');
const expertsRoutes = require('./expertsRoutes');
const instituteStudentRoutes = require('./instituteStudentRoutes');
const instituteAssetRoutes = require('./instituteAssetRoutes');
const instituteEventsRoutes = require('./instituteEventsRoutes');

router.use('/institute-courses', instituteCoursesRoutes);
router.use('/experts', expertsRoutes);
router.use('/institute-students', instituteStudentRoutes);
router.use('/institute-assets', instituteAssetRoutes);
router.use('/institute-events', instituteEventsRoutes);

module.exports = router;