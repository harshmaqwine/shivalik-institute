const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { DBConnect } = require('./index.js')
const { commonStatus } = require('../config/data.js');

const InstituteStudentsSchema = new Schema({
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'institutebatches',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
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

// Schema-level indexes for frequent lookup/search
// unique email only when record is not deleted (partial index avoids conflicts on soft-deleted rows)
// explicit name prevents mongoose from auto-generating "email_1" which may conflict
InstituteStudentsSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false }, name: 'idx_student_email' }
);
InstituteStudentsSchema.index({ batchId: 1 });
InstituteStudentsSchema.index({ status: 1 });
InstituteStudentsSchema.index({ name: 1 });
InstituteStudentsSchema.index({ phone: 1 });
InstituteStudentsSchema.index({ isDeleted: 1 });
// text index covering searchable fields
InstituteStudentsSchema.index({ name: 'text', email: 'text', phone: 'text' });

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
    // ignore index spec conflicts; these are handled via migrations or manual cleanup
    if (err && err.code === 86) {
        console.log('Index spec conflict ignored for students model');
        return;
    }
    console.log('Institute students Model Indexes Sync Error', err)
})

module.exports = InstituteStudentsModel