const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { DBConnect } = require('./index.js')
const { commonStatus } = require('../config/data.js');

const InstituteSubCoursesSchema = new Schema({
  instituteCourseId : {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'institutecourses',
  },
  name: {
    type: String,
    default: ''
  },
  price: {
    type: String,
    default: ''
  },
  discount: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: commonStatus,
    default: 'ACTIVE'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    index: true,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    required: false,
    default: Date.now
  },
  deletedAt: {
    type: Date,
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
});

InstituteSubCoursesSchema.index({ instituteCourseId : 1 });

InstituteSubCoursesSchema.methods.toJSON = function () {
  var obj = this.toObject();
  delete obj.hashed_password;
  delete obj.salt;
  return obj;
};

const InstituteSubCoursesModel = DBConnect.model('institutesubcourses', InstituteSubCoursesSchema)

InstituteSubCoursesModel.syncIndexes().then(() => {
  console.log('Institute sub course Model Indexes Synced')
}).catch((err) => {
  console.log('Institute sub course Model Indexes Sync Error', err)
})

module.exports = InstituteSubCoursesModel
