const cron = require('node-cron');

const commonConfig = require("../config/common");
const messages = require("../message");
// const backup = require('mongodb-backup');
const fs = require('fs');
const { exec } = require('child_process');
const archiver = require('archiver');
const { cronLogger, sourceKeyRemoveLogger } = require('../config/logger');
const moment = require("moment");
const axios = require('axios');

// MongoDB Atlas connection string
// const mongoURI = 'mongodb+srv://shivalik_user:<password>@<cluster>/<database>';
const mongoURI = process.env.ENTRYTRACKING_DB_URL;
const dbName = process.env.DB_NAME;
const bucketName = process.env.AWS_BUCKET;
// ENTRYTRACKING_DB_URL=mongodb+srv://shivalik_user:ORQV7NutIp0nBFqJ@shivalik-stag.0kark.mongodb.net/shivalik_sync_dev
// const SocketController = require("../controllers/socketController");
// const SendPushNotificationHelper = require("../libs/sendPushNotification.js");
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_DEFAULT_REGION,
});

// league data store to DB from bet365 data.
const testing = async (req, res) => {
  try {
    console.log("******************************* Cron is working fine.");
  } catch (err) {
    console.log(err);
  }
}

// Defind object to all function.
const obj = {
  testing: testing,
}

const job = (cron, time, fname) => {
  try {
    const cronJob = cron.schedule(time, obj[fname]);
    cronJob.start();
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  job,
}