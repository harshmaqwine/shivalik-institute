const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { DBConnect } = require('./index.js')
const { commonStatus } = require('../config/data.js'); 

const InstituteEventSchema = new Schema({
    eventName: {
        type: String,
        default: ''
    },
    eventDate: {
        type: Date,
        default: null
    },
    location: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
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
        required: false,
        default: null
    }
})

// indexes used for filtering/search
InstituteEventSchema.index({ eventName: 1 });
InstituteEventSchema.index({ eventDate: -1 });
InstituteEventSchema.index({ location: 1 });
InstituteEventSchema.index({ isDeleted: 1 }); 
InstituteEventSchema.index({ eventName: 'text', location: 'text' });

InstituteEventSchema.methods.toJSON = function () {
    var obj = this.toObject();
    delete obj.hashed_password;
    delete obj.salt;
    return obj;
}

const InstituteEventModel = DBConnect.model('instituteevents', InstituteEventSchema)

InstituteEventModel.syncIndexes().then(() => {
    console.log('Institute events Model Indexes Synced')
}).catch((err) => {
    console.log('Institute events Model Indexes Sync Error', err)
})

module.exports = InstituteEventModel