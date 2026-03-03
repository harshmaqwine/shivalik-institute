const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { DBConnect } = require('./index.js')
const { commonStatus } = require('../config/data.js');

const InstituteCoursesSchema = new Schema({
    name: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: commonStatus,
        default: 'ACTIVE'
    },
    price: {
        type: String,
        default: ''
    },
    discount: {
        type: String,
        default: ''
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

InstituteCoursesSchema.virtual('subCourses', {
    ref: 'institutesubcourses',
    localField: '_id',
    foreignField: 'instituteCourseId',
});

InstituteCoursesSchema.methods.toJSON = function () {
    var obj = this.toObject();
    delete obj.hashed_password;
    delete obj.salt;
    return obj;
};

const InstituteCoursesModel = DBConnect.model('institutecourses', InstituteCoursesSchema)

InstituteCoursesModel.syncIndexes().then(() => {
    console.log('Institute course Model Indexes Synced')
}).catch((err) => {
    console.log('Institute course Model Indexes Sync Error', err)
})

module.exports = InstituteCoursesModel
