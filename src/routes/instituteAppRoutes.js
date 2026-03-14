const MyCourseController = require("../controllers/myCourseController");
const router = require('express').Router(); 
const InstituteStudentController = require("../controllers/instituteStudentController");
const InstituteAppValidation = require("../validations/instituteAppValidation.js");
const MyMaterialController = require("../controllers/myMaterialController.js");

router.post("/my-courses", InstituteAppValidation.myCoursesList, MyCourseController.myCoursesList);
router.post("/my-sub-courses", InstituteAppValidation.mySubCoursesList, MyCourseController.mySubCoursesList);
router.post("/my-batches", InstituteAppValidation.myBatchesList, MyCourseController.myBatchesList);
router.post("/my-lectures", InstituteAppValidation.myLectureList, MyCourseController.myLectureList); 
router.post("/other-courses", InstituteAppValidation.otherCoursesList, MyCourseController.otherCoursesList);
router.post("/my-materials", InstituteAppValidation.myMaterialList, MyMaterialController.myMaterialList);
router.post("/my-lecture-materials", InstituteAppValidation.myLectureMaterialList, MyMaterialController.myLectureMaterialList);

module.exports = router;