const router = require('express').Router();
const { superAdminVerifyToken } = require("../middleware/authJwt");
const InstituteStudentController = require("../controllers/instituteStudentController");
const InstituteStudentValidation = require("../validations/instituteStudentValidation.js");

router.post("/create", /*superAdminVerifyToken,*/ InstituteStudentValidation.create, InstituteStudentController.createStudent);

router.get("/list", /*superAdminVerifyToken,*/  InstituteStudentValidation.list, InstituteStudentController.listStudents);

router.get("/details/:studentId", /*superAdminVerifyToken,*/ InstituteStudentValidation.detail, InstituteStudentController.detailStudent);

router.put("/update/:studentId", /*superAdminVerifyToken,*/ InstituteStudentValidation.update, InstituteStudentController.updateStudent);

router.delete("/delete/:studentId", /*superAdminVerifyToken,*/ InstituteStudentValidation.delete, InstituteStudentController.deleteStudent);

router.get("/batch/dropdown-list", /*[superAdminVerifyToken],*/ InstituteStudentValidation.batchDropdownList, InstituteStudentController.batchDropdownList);
    
module.exports = router;