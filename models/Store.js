'use strict'
const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    pan: {
        type: String,
        required: true
    },
    gstin: {
        type: String,
        required: true
    },
    accountDetails: {
        accountNumber: {
            type: Number,
            required: true
        },
        accountName: {
            type: String,
            required: true
        },
        bankName: {
            type: String,
            required: true
        },
        ifscCode: {
            type: String,
            required: true
        }
    }
});

var Store = mongoose.model('Store', storeSchema, process.env.STORE_DETAILS_COLLECTION);

module.exports = Store;