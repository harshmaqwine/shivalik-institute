const router = require('express').Router();
const { superAdminVerifyToken } = require("../middleware/authJwt");
const InstituteEventsController = require("../controllers/instituteEventsController");
const InstituteEventsValidation = require("../validations/instituteEventsValidation.js");

router.post("/create", /*[superAdminVerifyToken],*/ InstituteEventsValidation.create, InstituteEventsController.create);

router.get("/list", /*[superAdminVerifyToken],*/ InstituteEventsValidation.list, InstituteEventsController.list);

router.get("/details/:eventId", /*[superAdminVerifyToken],*/ InstituteEventsValidation.details, InstituteEventsController.details);

router.put("/update/:eventId", /*[superAdminVerifyToken],*/ InstituteEventsValidation.update, InstituteEventsController.updateEvent);

router.delete("/delete/:eventId", /*[superAdminVerifyToken],*/ InstituteEventsValidation.delete, InstituteEventsController.deleteEvent);

module.exports = router;