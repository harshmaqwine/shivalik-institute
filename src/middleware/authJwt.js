const jwt = require("jsonwebtoken");
// const config = require("../config/auth");
// const db = require("../models");
const messages = require("../message");
const response = require("../config/response.js");
// const UsersModel = require('../models/users.js');
// const UserRolesModel = require('../models/models/userRoles.js')
const CommonConfig = require('../config/common.js');
const retry = require('async-retry');
const axios = require('axios');
const { userCache } = require('../utils/userCache.js');
// const TokenBlackListsModel = require('../models/models/tokenBlackLists.js');

exports.adminVerifyToken =  async (req, res, next) => {
    const token = req.header('Authorization')

    if (!token) {
        return res.status(401).send(response.toJson(messages['en'].auth.empty_token));
    }

    // const blockList = await TokenBlackListsModel.findOne({ token : token });
    // if(blockList){
    //     return res.status(401).send(response.toJson(messages['en'].auth.un_authenticate));
    // }

    jwt.verify(token, CommonConfig.JWT_SECRET_USER, async (err, decoded) => {
        if (err) {
            return res.status(401).send(response.toJson(messages['en'].auth.un_authenticate));
        }

        req.userId = decoded.id;
        // const existsUser = await UsersModel.findOne({
        //     // $or: [{ role: "SubAdmin" }, { role: "KnowledgeAdmin" }, { role: "LandAdmin" }],
        //     _id : decoded.id, deletedAt: { $exists: false }
        // }).lean();

        // if (!existsUser) {
        //     return res.status(401).send(response.toJson(messages['en'].auth.un_authenticate));
        // }

        // req.user = existsUser;
        next();
    });
};

exports.superAdminVerifyToken = async (req, res, next) => {
    const token = req.header('Authorization')

    if (!token) {
        return res.status(401).send(response.toJson(messages['en'].auth.empty_token));
    }

    // const blacklistResponse = await retry(
    //     () => axios.post(`${process.env.USER_ROUTE_URL}common/access-token-valid`, {
    //         token : token
    //     }),
    //     { retries: 3, minTimeout: 1000 }
    // );
    let blacklistResponse;
    try {
        blacklistResponse = await axios.post(`${process.env.USER_ROUTE_URL}common/access-token-valid`, {
            token : token
        });
    } catch (err) {
        return res.status(404).send(response.toJson(messages['en'].common.user_service_unable));
    }

    if(blacklistResponse.status != 200){
        return res.status(401).send(response.toJson(messages['en'].auth.blacklist));
    }

    let decoded;
    try {
        // Proceed with decoded payload
        decoded = jwt.verify(token, CommonConfig.JWT_SECRET_USER);
    } catch (err) {
        return res.status(401).send(response.toJson(messages['en'].auth.token_expired));
    }

    // console.log(decoded);

    // Check user existence
    const cacheKey = `user:${decoded.id}`;
    let userData = userCache.get(cacheKey);

    // if (!userData) {
        try {
            const userResponse = await retry(
                () => axios.get(`${process.env.USER_ROUTE_URL}users/detail?userId=${decoded.id}`),
                { retries: 3, minTimeout: 1000 }
            );
            userData = userResponse.data.result;
            req.user = userData;
            userCache.set(cacheKey, userData);
            console.log(`Land AUTH : superAdminVerifyToken : Fetched and cached user: ${cacheKey}`);
        } catch (error) {
            console.error(`Land AUTH : superAdminVerifyToken : Error fetching user ${decoded.userId}:`, error.message);
            return res.status(401).send(response.toJson(messages['en'].auth.not_auth));
        }
    // }

    req.userId = decoded.id;
    // console.log(req.user);
    // console.log("klkl");
    next();
};

// Simple middleware functions for development/testing
exports.cpRoleVerifyToken = async (req, res, next) => {
    console.log('cpRoleVerifyToken - Development mode bypass');
    req.userId = 'test-user-id';
    next();
};

exports.isCommonUserRoleAuthenticated = async (req, res, next) => {
    console.log('isCommonUserRoleAuthenticated - Development mode bypass');
    req.userId = 'test-user-id';
    next();
};

exports.isCommonUserAuthenticated = async (req, res, next) => {
    const token = req.header('Authorization')

    if (!token) {
        return res.status(401).send(response.toJson(messages['en'].auth.empty_token));
    }

    let blacklistResponse;
    try {
        blacklistResponse = await axios.post(`${process.env.USER_ROUTE_URL}common/access-token-valid`, {
            token : token
        });
    } catch (err) {
        return res.status(404).send(response.toJson(messages['en'].common.user_service_unable));
    }

    if(blacklistResponse.status != 200){
        return res.status(401).send(response.toJson(messages['en'].auth.blacklist));
    }

    let decoded;
    try {
        // Proceed with decoded payload
        decoded = jwt.verify(token, CommonConfig.JWT_SECRET_USER);
    } catch (err) {
        return res.status(401).send(response.toJson(messages['en'].auth.token_expired));
    }

   // Check user existence
    const cacheKey = `user:${decoded.id}`;
    let userData = userCache.get(cacheKey);

    // if (!userData) {
        try {
            const userResponse = await axios.get(`${process.env.USER_ROUTE_URL}users/detail?userId=${decoded.id}`);
            // const userResponse = await retry(
            //     () => axios.get(`${process.env.USER_ROUTE_URL}users/detail?userId=${decoded.id}`),
            //     { retries: 3, minTimeout: 1000 }
            // );
            userData = userResponse.data.result;
            req.user = userData;
            userCache.set(cacheKey, userData);
            console.log(`Land AUTH : superAdminVerifyToken : Fetched and cached user: ${cacheKey}`);
        } catch (error) {
            console.error(`Land AUTH : superAdminVerifyToken : Error fetching user ${decoded.userId}:`, error.message);
            return res.status(401).send(response.toJson(messages['en'].auth.not_auth));
        }
    // }

    req.userId = decoded.id;
    // console.log(req.user);
    // console.log("klkl");
    next();
};