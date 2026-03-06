const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { DBConnect } = require('./index.js')
const { commonStatus } = require('../config/data.js');
const { details } = require('../validations/instituteCourseValidation.js');

const instituteLectureSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'institutecourses',
        required: true
    },
    subCourseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'institutesubcourses',
        required: false
    },
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'institutebatches',
        required: false
    },
    moduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'institutemodules',
        required: false
    },
    classroomNumber: {
        type: String,
        required: true
    },
    lectureDate: {
        type: Date,
        required: true
    },
    // Sessions details.
    details: [
        {
            expertId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'instituteexperts'
            },
            topic: {
                type: String,
                required: true
            },
            lectureType: {
                type: String,
                enum: ["Guest", "Module", "Site Visit", "Master Class"],
                required: true
            },
            sessionStartTime: {
                type: String,
                required: true
            },
            sessionEndTime: {
                type: String,
                required: true
            },
        }
    ],

    material: {
        type: String
    },

    createFeedbackForLearner: {
        type: Boolean,
        default: false
    },
    feedbackForCoordinator: {
        type: String,
        required: false
    },

    // Checkboxes 
    projectReviewLecture: {
        type: Boolean,
        default: false
    },
    juryLecture: {
        type: Boolean,
        default: false
    },
    moduleFinished: {
        type: Boolean,
        default: false
    },
    submissionRequired: {
        type: Boolean,
        default: false
    },
    notifyStudents: {
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
        type: Date,
    },
});

// indexes used for filtering/search
instituteLectureSchema.index({ courseId: 1 });
instituteLectureSchema.index({ isDeleted: 1, lectureDate: -1 });
instituteLectureSchema.index({ batchId: 1, isDeleted: 1 });
instituteLectureSchema.index({ courseId: 1, subCourseId: 1, isDeleted: 1 });
instituteLectureSchema.index({ "details.expertId": 1 });
instituteLectureSchema.index({ classroomNumber: 1 });

instituteLectureSchema.methods.toJSON = function () {
    var obj = this.toObject();
    delete obj.hashed_password;
    delete obj.salt;
    return obj;
}

const InstituteLectures = DBConnect.model('institutelectures', instituteLectureSchema);

InstituteLectures.syncIndexes().then(() => {
    console.log('Institute lectures Model Indexes Synced')
}).catch((err) => {
    console.log('Institute lectures Model Indexes Sync Error', err)
})

module.exports = {
    InstituteLectures
}