const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { DBConnect } = require('./index.js')
const { commonStatus, prefixName, gender } = require('../config/data.js');

const expertsSchema = new Schema({
    prefixName: {
        type: String,
        enum: prefixName,
        default: prefixName[0] || 'MR'
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true, 
    },
    contactNo: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: gender,
        default: gender[0] || 'MALE'
    },
    dateOfBirth: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    familyBackground: {
        type: String,
        default: ''
    },
    highestEducation : {
        type: String,
        required: true
    },
    collegeName: {
        type: String
    },
    currentDesignation: {
        type: String 
    },
    teachingExperience: {
        type: Number 
    },
    industrialExperience: {
        type: Number,
        required: true
    },
    motivationToJoin: {
        type: String,
        default: ''
    },
    linkedinProfileLink: {
        type: String,
        default: ''
    },
    facebookProfileLink: {
        type: String,
        default: ''
    },
    perHourRate: {
        type: Number,
        required: true
    },
    bankDetails: {
        bankName: { type: String, default: '' },
        accountNumber: { type: String, default: '' },
        ifscCode: { type: String, default: '' }
    },
    about: {
        type: String,
        default: ''
    },
    past: {
        type: String,
        default: ''
    },
    skills: {
        type: String,
        default: ''
    },
    education: {
        type: String,
        default: ''
    },
    alternateEmail: {
        type: String,
        default: ''
    },
    panCard: {
        type: String,
        default: ''
    },
    profilePicture: {
        type: String,
        default: ''
    },
    isCoordinator: {
        type: Boolean,
        default: false
    },
    specialization: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: commonStatus,
        default: 'ACTIVE'
    },
    isDeleted: {
        type: Boolean,
        default: false
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
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    deletedAt: {
        type: Date,
    },
});


// indexes used for filtering/search
expertsSchema.index({ isDeleted: 1, createdAt: -1 });
expertsSchema.index({ status: 1, isDeleted: 1 });
expertsSchema.index({ name: 1 });
expertsSchema.index({ specialization: 1 });
expertsSchema.index({ name: 'text', specialization: 'text' });

expertsSchema.methods.toJSON = function () {
    var obj = this.toObject();
    delete obj.hashed_password;
    delete obj.salt;
    return obj;
}

const Experts = DBConnect.model('instituteexperts', expertsSchema);

Experts.syncIndexes().then(() => {
    console.log('Experts Model Indexes Synced')
}).catch((err) => {
    console.log('Experts Model Indexes Sync Error', err)
})

module.exports = {
    Experts
}