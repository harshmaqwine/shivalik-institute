const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { DBConnect } = require('./index.js')
const { commonStatus, prefixName, gender } = require('../config/data.js');

const InstituteStudentsSchema = new Schema({
    CourseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'institutecourses',
        required: true
    },
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'institutebatches',
        // required: true
    },
    prefixName: {
        type: String,
        enum: prefixName,
        // required: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    countryCode: {
        type: String,
        required: true
    },
    countryName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    alternatePhone: {
        type: String
    },
    enrollmentNo: {
        type: String,
        required: true,
        unique: true
    },
    gender: {
        type: String,
        enum: gender,
        required: true
    },
    dateOfBirth: {
        type: Date
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
    highestEducation: {
        type: String
    },
    currentDesignation: {
        type: String
    },
    yearsOfExperienceRealEstate: {
        type: Number,
        required: true
    },
    courseStartDate: {
        type: Date,
        required: true
    },
    enrolledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    holdingSeat: {
        type: Boolean,
        default: false
    },
    enrolledCourse: {
        type: Boolean,
        default: false
    },
    documentsSubmitted: {
        aadharCard: { type: String },
        receipt: { type: String },
        photo: { type: String }
    },
    profilePicture: {
        type: String
    },

    isCoordinator: {
        type: Boolean,
        default: false
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
        type: Date
    }
});

InstituteStudentsSchema.index(
    { email: 1, batchId: 1 },
    { unique: true, partialFilterExpression: { isDeleted: false }, name: 'idx_student_email_batch' }
);

// Unique Enrollment No
InstituteStudentsSchema.index(
    { enrollmentNo: 1 },
    { unique: true, partialFilterExpression: { isDeleted: false }, name: 'idx_enrollment_no' }
);

// Filtering indexes
InstituteStudentsSchema.index({ batchId: 1 });
InstituteStudentsSchema.index({ status: 1 });
InstituteStudentsSchema.index({ firstName: 1 });
InstituteStudentsSchema.index({ lastName: 1 });
// enforce unique phone per active student
// unique phone per batch (same person may register for multiple batches)
InstituteStudentsSchema.index(
    { phone: 1, batchId: 1 },
    { unique: true, partialFilterExpression: { isDeleted: false }, name: 'idx_student_phone_batch' }
);
InstituteStudentsSchema.index({ isDeleted: 1 });

// Search index
InstituteStudentsSchema.index({
    firstName: 'text',
    lastName: 'text',
    email: 'text',
    phone: 'text',
    enrollmentNo: 'text'
});

InstituteStudentsSchema.methods.toJSON = function () {
    var obj = this.toObject();
    delete obj.hashed_password;
    delete obj.salt;
    return obj;
}

const InstituteStudentsModel = DBConnect.model('institutestudents', InstituteStudentsSchema);

InstituteStudentsModel.syncIndexes().then(() => {
    console.log('Institute students Model Indexes Synced')
}).catch((err) => {
    if (err && err.code === 86) {
        console.log('Index spec conflict ignored for students model');
        return;
    }
    console.log('Institute students Model Indexes Sync Error', err)
})

module.exports = InstituteStudentsModel