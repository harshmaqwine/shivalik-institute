const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { DBConnect } = require('./index.js')
const { commonStatus } = require('../config/data.js');

const InstituteBatchesSchema = new Schema({
    instituteCourseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'institutecourses'
    },
    instituteSubCourseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'institutesubcourses'
    },
    batchName: {
        type: String,
        default: ''
    },
    slug: {
        type: String,
        default: ''
    },
    startTime: {
        type: String,
        default: ''
    },
    endTime: {
        type: String,
        default: ''
    },
    shift: {
        type: String,
        default: ''
    },
    orientationDate: {
        type: String,
        default: ''
    },
    registrationEndDate: {
        type: String,
        default: ''
    },
    startDate: {
        type: String,
        default: ''
    },
    endDate: {
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
    }
});

InstituteBatchesSchema.index({instituteCourseId: 1})
InstituteBatchesSchema.index({instituteSubCourseId: 1})
InstituteBatchesSchema.index({batchName: 1})
InstituteBatchesSchema.index({slug: 1})


InstituteBatchesSchema.methods.toJSON = function () {
    var obj = this.toObject();
    delete obj.hashed_password;
    delete obj.salt;
    return obj;
};

const InstituteBatchesModel = DBConnect.model('institutebatches', InstituteBatchesSchema)

InstituteBatchesModel.syncIndexes().then(() => {
    console.log('Institute batches Model Indexes Synced')
}).catch((err) => {
    console.log('Institute batches Model Indexes Sync Error', err)
})

module.exports = InstituteBatchesModel
