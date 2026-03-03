const router = require('express').Router();
const { superAdminVerifyToken } = require("../middleware/authJwt");
const ExpertsController = require("../controllers/expertsController");
const ExpertsValidation = require("../validations/expertsValidation.js");

router.post("/create", /*[superAdminVerifyToken],*/ ExpertsValidation.create, ExpertsController.create);

router.get("/list", /*[superAdminVerifyToken],*/ ExpertsValidation.list, ExpertsController.list);

router.get("/details/:id", /*[superAdminVerifyToken],*/ ExpertsValidation.details, ExpertsController.details);

router.put("/update/:expertId", /*[superAdminVerifyToken],*/ ExpertsValidation.update, ExpertsController.update);

router.delete("/delete/:expertId", /*[superAdminVerifyToken],*/ ExpertsValidation.delete, ExpertsController.deleteExpert);

module.exports = router;