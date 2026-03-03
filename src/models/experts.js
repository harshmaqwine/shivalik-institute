const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { DBConnect } = require('./index.js')
const { commonStatus } = require('../config/data.js');

const expertsSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    specialization: {
        type: String,
        required: true
    },
    perHourRate: {
        type: Number,
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

const Experts = DBConnect.model('experts', expertsSchema);

Experts.syncIndexes().then(() => {
    console.log('Experts Model Indexes Synced')
}).catch((err) => {
    console.log('Experts Model Indexes Sync Error', err)
})

module.exports = {
    Experts
}