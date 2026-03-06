const router = require('express').Router();
const { superAdminVerifyToken } = require("../middleware/authJwt");
const InstituteMaterialsController = require("../controllers/InstituteMaterialsController");
const InstituteMaterialsValidation = require("../validations/instituteMaterialsValidation.js");

router.get("/materials-list", /*[superAdminVerifyToken],*/ InstituteMaterialsValidation.getModulesList, InstituteMaterialsController.materialsList);

module.exports = router;