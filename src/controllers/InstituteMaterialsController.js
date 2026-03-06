const messages = require("../message/index.js");
const response = require("../config/response.js");
const { validationResult } = require('express-validator');
const CommonConfig = require('../config/common.js');
const CommonFun = require('../libs/common.js');
const {InstituteModulesModel} = require('../models/instituteModules.js');

// get only material link all modules list for dropdown
const materialsList = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(response.toJson(errors.errors[0].msg));
    }

    try {
        // Role validation
        // const allowedRoles = ["SuperAdmin", "InstituteManager", "InstituteExecutive"];
        // const userHasAccess = req.user?.userRoles?.some(role =>
        //     allowedRoles.includes(role)
        // );

        // if (!userHasAccess) {
        //     return res.status(404).send(
        //         response.toJson(messages['en'].auth.not_access)
        //     );
        // }

        const modules = await InstituteModulesModel
            .find({ isDeleted: false })
            .select("_id moduleNumber name materialLink")
            .sort({ moduleNumber: 1 })
            .lean();

        return res.status(200).send(
            response.toJson(
                messages['en'].common.list_success,
                { modules }
            )
        );

    } catch (error) {

        console.error("Get Modules Error:", error);

        return res.status(500).send(
            response.toJson(messages['en'].common.list_failure)
        );
    }
};

module.exports = {
    materialsList
};