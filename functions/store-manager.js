'use strict';

const Store = require('../models/Store');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const ResponseGenerator = require('../utils/response-generator');

const url = process.env.DB_HOST + "/" + process.env.USER_DB;

module.exports.addStoreDetails = async function (event, context) {
    try {
        await mongoose.connect(url);
        const decodedUser = await jwt.verify(event.headers.authorizationToken, process.env.JWT_SECRET);
        if(decodedUser.userType !== 'store') {
            return ResponseGenerator.generateResponse(400, {message: "Access Denied"});
        }
        const storeDetails = await Store.findOne({_id: decodedUser.userId});
        if(storeDetails !== null) {
            return ResponseGenerator.generateResponse(400, {message: "Details " +
                    "already present in database"});
        }
        const requestBody = JSON.parse(event.body);
        requestBody["_id"] = decodedUser.userId;
        const store = new Store(requestBody);
        await store.save();
        return ResponseGenerator.generateResponse(200, {message: "Details added successfully " +
                "to database"});
    } catch (err) {
        console.error(err);
        return ResponseGenerator.generateResponse(400, {message: err.message});
    }
}

module.exports.getStoreDetails = async function (event, context) {
    try {
        await mongoose.connect(url);
        const decodedUser = await jwt.verify(event.headers.authorizationToken, process.env.JWT_SECRET);
        const store = await Store.findOne({_id: decodedUser.userId});
        if(store === null) {
            return ResponseGenerator.generateResponse(400, {message: "No details found"});
        }
        return ResponseGenerator.generateResponse(200, store);
    } catch(err) {
        console.log(err);
        return ResponseGenerator.generateResponse(400, {message: err.message});
    }
}