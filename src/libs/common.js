const messages = require("../message");
const { randomInt } = require('crypto');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const { projectFacebookLogger, anarockSPlusProjectLogger, instituteRoundRobinLogger } = require("../config/logger.js");
const axios = require('axios');
var crypto = require('crypto');
const { parsePhoneNumber } = require('libphonenumber-js');
const CommonConfig = require('../config/common.js');

// const UsersModel = require('../models/users.js');

const randomStr = async (reqLength, checkExists) => {
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  let result = '';

  for (let i = 0; i < reqLength; i++) {
    result += char.charAt(Math.floor(Math.random() * char.length));
  }

  // if (checkExists) {
  //   const existsUser = await UsersModel.findOne({ referCode: result });

  //   if (existsUser) {
  //     randomStr(reqLength, checkExists);
  //   }
  // }

  return result;
}

const createSlug = async (input) => {
  return input.toLowerCase()           // Convert to lowercase
    .replace(/\s+/g, "_")    // Replace spaces with underscores
    .replace(/[^\w_]/g, ""); // Remove non-word characters except underscores
}

const capitalized = async (letter) => {
  return letter.split(' ')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');
}

const transformObject = async (obj, fieldsToRemove, fieldsToAdd) => {
  const sanitizedObject = Object.keys(obj)
    .filter(key => !fieldsToRemove.includes(key))
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});

  // Add new fields
  return { ...sanitizedObject, ...fieldsToAdd(obj) };
}


module.exports = {
  createSlug,
  randomStr,
  transformObject,
  capitalized,
}
