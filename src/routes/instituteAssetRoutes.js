const router = require('express').Router();
const { superAdminVerifyToken } = require("../middleware/authJwt");
const InstituteAssetController = require("../controllers/InstituteAssetController");
const InstituteAssetValidation = require("../validations/instituteAssetValidation.js");

router.post("/create", /*[superAdminVerifyToken],*/ InstituteAssetValidation.create, InstituteAssetController.create);

router.get("/list", /*[superAdminVerifyToken],*/ InstituteAssetValidation.list, InstituteAssetController.list);

router.get("/details/:assetId", /*[superAdminVerifyToken],*/ InstituteAssetValidation.details, InstituteAssetController.details);

router.put("/update/:assetId", /*[superAdminVerifyToken],*/ InstituteAssetValidation.update, InstituteAssetController.updateAsset);

router.delete("/delete/:assetId", /*[superAdminVerifyToken],*/ InstituteAssetValidation.delete, InstituteAssetController.deleteAsset);

module.exports = router;