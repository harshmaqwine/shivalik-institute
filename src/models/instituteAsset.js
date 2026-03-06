const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { DBConnect } = require('./index.js')
const { commonStatus } = require('../config/data.js'); 

const InstituteAssetSchema = new Schema({
    assetNumber: {
        type: String,
        default: ''
    },
    assetType: {
        type: String,
        default: ''
    },
    assetName: {
        type: String,
        default: ''
    },
    capacity: { 
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
InstituteAssetSchema.index({ assetNumber: 1 });
InstituteAssetSchema.index({ assetType: 1 });
InstituteAssetSchema.index({ assetName: 1 });
InstituteAssetSchema.index({ isDeleted: 1 }); 
InstituteAssetSchema.index({ assetNumber: 'text', assetType: 'text', assetName: 'text' });

InstituteAssetSchema.methods.toJSON = function () {
    var obj = this.toObject();
    delete obj.hashed_password;
    delete obj.salt;
    return obj;
}

const InstituteAssetModel = DBConnect.model('instituteassets', InstituteAssetSchema)

// ensure indexes are synced at startup
InstituteAssetModel.syncIndexes().then(() => {
    console.log('Institute assets Model Indexes Synced')
}).catch((err) => {
    console.log('Institute assets Model Indexes Sync Error', err)
})

module.exports = InstituteAssetModel