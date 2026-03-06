const express = require('express');
const router = express.Router();

const instituteCoursesRoutes = require('./instituteCoursesRoutes');
const expertsRoutes = require('./InstituteExpertsRoutes');
const instituteStudentRoutes = require('./instituteStudentRoutes');
const instituteAssetRoutes = require('./instituteAssetRoutes');
const instituteEventsRoutes = require('./instituteEventsRoutes');
const instituteMaterialsRoutes = require('./instituteMaterialsRoutes');

router.use('/institute-courses', instituteCoursesRoutes);
router.use('/experts', expertsRoutes);
router.use('/institute-students', instituteStudentRoutes);
router.use('/institute-assets', instituteAssetRoutes);
router.use('/institute-events', instituteEventsRoutes);
router.use('/institute-materials', instituteMaterialsRoutes);

module.exports = router;