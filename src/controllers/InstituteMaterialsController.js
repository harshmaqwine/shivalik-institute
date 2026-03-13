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
        // Role validation (commented out like other controllers)
        // const allowedRoles = ["SuperAdmin", "InstituteManager", "InstituteExecutive"];
        // const userHasAccess = req.user?.userRoles?.some(role =>
        //     allowedRoles.includes(role)
        // );

        // if (!userHasAccess) {
        //     return res.status(404).send(
        //         response.toJson(messages['en'].auth.not_access)
        //     );
        // }

        // build filters for optional fields
        const moduleFilters = { isDeleted: false };
        if (req.query.instituteCourseId) moduleFilters.instituteCourseId = req.query.instituteCourseId;
        if (req.query.instituteSubCourseId) moduleFilters.instituteSubCourseId = req.query.instituteSubCourseId;
        if (req.query.status) moduleFilters.status = req.query.status;
        if (req.query.search) {
            moduleFilters.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { moduleNumber: { $regex: req.query.search, $options: 'i' } }
            ];
        }
        // pagination
        const page = parseInt(req.query.page) || 1;
        const pageSize = CommonConfig.instituteCourseListLimit || 10;
        const skip = (page - 1) * pageSize;

        // sorting
        const sortBy = req.query.sortBy || 'moduleNumber';
        const sortOrder = req.query.sort === 'asc' ? 1 : -1;
        const sorting = { [sortBy]: sortOrder };

        const [modules, total] = await Promise.all([
            InstituteModulesModel
                .find(moduleFilters)
                .populate('instituteCourseId', 'name')
                .select('_id moduleNumber name materialLink status instituteCourseId')
                .sort(sorting)
                .skip(skip)
                .limit(pageSize)
                .lean(),
            InstituteModulesModel.countDocuments(moduleFilters)
        ]);

        const formatted = modules.map(m => ({
            _id: m._id,
            moduleNumber: m.moduleNumber,
            name: m.name,
            materialLink: m.materialLink,
            status: m.status,
            course: m.instituteCourseId ? { _id: m.instituteCourseId._id, name: m.instituteCourseId.name } : null
        }));

        return res.status(200).send(
            response.toJson(
                messages['en'].common.list_success,
                {
                    modules: formatted,
                    total,
                    currentPage: page,
                    totalPages: total > 0 ? Math.ceil(total / pageSize) : 0
                }
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