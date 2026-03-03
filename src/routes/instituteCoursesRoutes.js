const router = require('express').Router();
const { superAdminVerifyToken } = require("../middleware/authJwt");
const InstituteCourseController = require("../controllers/instituteCourseController");
const InstituteCourseValidation = require("../validations/instituteCourseValidation");

router.post("/create", /*[superAdminVerifyToken], */InstituteCourseValidation.create, InstituteCourseController.create);

router.put("/update/:courseId", /*[superAdminVerifyToken],*/ InstituteCourseValidation.updateCourse, InstituteCourseController.updateCourse);

router.delete("/delete/:courseId", /*[superAdminVerifyToken],*/ InstituteCourseValidation.deleteCourse, InstituteCourseController.deleteCourse);

router.post("/sub-course/create", /*[superAdminVerifyToken], */InstituteCourseValidation.subCourseCreate, InstituteCourseController.createSubCourse);

router.put("/sub-course/update/:subCourseId", /*[superAdminVerifyToken],*/ InstituteCourseValidation.subCourseUpdate, InstituteCourseController.updateSubCourse);

router.delete("/sub-course/delete/:subCourseId", /*[superAdminVerifyToken],*/ InstituteCourseValidation.subCourseDelete, InstituteCourseController.deleteSubCourse);

router.get("/sub-course/list", /*[superAdminVerifyToken],*/ InstituteCourseValidation.subCourseList, InstituteCourseController.listSubCourse);

router.get("/list", /*[superAdminVerifyToken],*/ InstituteCourseValidation.list, InstituteCourseController.list);

router.get("/details/:courseId", /*[superAdminVerifyToken],*/ InstituteCourseValidation.details, InstituteCourseController.details);

router.get("/sub-course/details/:subCourseId", /*[superAdminVerifyToken],*/ InstituteCourseValidation.subCourseDetails, InstituteCourseController.subCourseDetails);

// public routes
router.get("/public-list", InstituteCourseValidation.publicList, InstituteCourseController.publicList);

router.get("/subcource/public-list", InstituteCourseValidation.subCourcePublicList, InstituteCourseController.subCourcePublicList);

router.get("/batch/public-list", InstituteCourseValidation.batchPublicList, InstituteCourseController.batchPublicList);

// institute batches
router.post("/batch/create", /*[superAdminVerifyToken],*/ InstituteCourseValidation.batchCreate, InstituteCourseController.createBatch);

router.put("/batch/update/:batchId", /*[superAdminVerifyToken],*/ InstituteCourseValidation.batchUpdate, InstituteCourseController.updateBatch);

router.delete("/batch/delete/:batchId", /*[superAdminVerifyToken],*/ InstituteCourseValidation.batchDelete, InstituteCourseController.deleteBatch);

router.get("/batch/list", /*[superAdminVerifyToken],*/ InstituteCourseValidation.batchList, InstituteCourseController.listBatch);

router.get("/batch/details/:batchId", /*[superAdminVerifyToken],*/ InstituteCourseValidation.batchDetails, InstituteCourseController.batchDetails);

// dropdown list
router.get("/course/dropdown-list", /*[superAdminVerifyToken],*/ InstituteCourseValidation.courseDropdownList, InstituteCourseController.courseDropdownList);

router.get("/sub-course/dropdown-list", /*[superAdminVerifyToken],*/ InstituteCourseValidation.subCourseDropdownList, InstituteCourseController.subCourseDropdownList);

router.get("/batch/dropdown-list", /*[superAdminVerifyToken],*/ InstituteCourseValidation.batchDropdownList, InstituteCourseController.batchDropdownList);

// institute modules
router.post("/module/create", /*[superAdminVerifyToken],*/ InstituteCourseValidation.createModule, InstituteCourseController.createModule);
router.put("/module/update/:moduleId", /*[superAdminVerifyToken],*/ InstituteCourseValidation.updateModule, InstituteCourseController.updateModule);
router.delete("/module/delete/:moduleId", /*[superAdminVerifyToken],*/ InstituteCourseValidation.deleteModule, InstituteCourseController.deleteModule);
router.get("/module/list", /*[superAdminVerifyToken],*/ InstituteCourseValidation.listModule, InstituteCourseController.listModule);
router.get("/module/details/:moduleId", /*[superAdminVerifyToken],*/ InstituteCourseValidation.moduleDetails, InstituteCourseController.moduleDetails);

//  institute lectures
router.get("/expert/dropdown-list", /*[superAdminVerifyToken],*/ InstituteCourseValidation.expertDropdownList, InstituteCourseController.expertDropdownList);
router.post("/lecture/create", /*[superAdminVerifyToken],*/ InstituteCourseValidation.createLecture, InstituteCourseController.createLecture);
router.put("/lecture/update/:lectureId", /*[superAdminVerifyToken],*/ InstituteCourseValidation.updateLecture, InstituteCourseController.updateLecture);
router.delete("/lecture/delete/:lectureId", /*[superAdminVerifyToken],*/ InstituteCourseValidation.deleteLecture, InstituteCourseController.deleteLecture);
router.get("/lecture/list", /*[superAdminVerifyToken],*/ InstituteCourseValidation.listLecture, InstituteCourseController.listLecture);
router.get("/lecture/details/:lectureId", /*[superAdminVerifyToken],*/ InstituteCourseValidation.lectureDetails, InstituteCourseController.lectureDetails);

module.exports = router;