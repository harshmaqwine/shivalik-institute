const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { DBConnect } = require('./index.js')
const { commonStatus } = require('../config/data.js');

const InstituteModulesSchema = new Schema({
    instituteCourseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'institutecourses'
    },
    instituteSubCourseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'institutesubcourses'
    },
    moduleNumber: { 
        type: String, 
        default: ''
    }, 
    name: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    materialLink: {
        type: String,
        default: ''
    },
    feedback: {
        type: String,
        default: ''
    },
    coordinator: {
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

// indexes used for filtering/search
InstituteModulesSchema.index({ instituteCourseId: 1, instituteSubCourseId: 1, moduleNumber: 1 });

InstituteModulesSchema.methods.toJSON = function () {
    var obj = this.toObject();
    delete obj.hashed_password;
    delete obj.salt;
    return obj;
}

const InstituteModulesModel = DBConnect.model('institutemodules', InstituteModulesSchema);

InstituteModulesModel.syncIndexes().then(() => {
    console.log('Institute modules Model Indexes Synced')
}).catch((err) => {
    console.log('Institute modules Model Indexes Sync Error', err)
})

module.exports = {
    InstituteModulesModel
};