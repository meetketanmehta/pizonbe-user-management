'use strict';

const mongoose = require('mongoose');
const ResponseGenerator = require('../utils/response-generator');
const jwt = require('jsonwebtoken');
const Address = require('../models/Address');

const url = process.env.DB_HOST + "/" + process.env.USER_DB;

module.exports.addAddress = async function(event, context) {
    try {
        await mongoose.connect(url);
        const requestBody = JSON.parse(event.body);
        const decodedUser = await jwt.verify(event.headers.authorizationToken, process.env.JWT_SECRET);
        if(decodedUser.userType !== 'customer') {
            const address = await Address.findOne({userId: decodedUser.userId});
            if(address !== null) {
                return ResponseGenerator.generateResponse(400, "Address already present in database");
            }
        }
        requestBody['userId'] = decodedUser.userId;
        requestBody['userType'] = decodedUser.userType;
        const address = new Address(requestBody);
        await address.save();
        return ResponseGenerator.generateResponse(200, {message: "Address added successfully"});
    } catch (err) {
        return ResponseGenerator.generateResponse(400, {message: err.message});
    }
}

module.exports.getAddress = async function (event, context) {
    try {
        await mongoose.connect(url);
        var addId = null;
        if(event.pathParameters) {
            addId = event.pathParameters.addId;
        }
        //const requestBody = JSON.parse(event.body);
        const decodedUser = await jwt.verify(event.headers.authorizationToken, process.env.JWT_SECRET);
        const queryObj = {
            userId: decodedUser.userId
        };
        if(addId !== null) {
            queryObj["_id"] = addId;
        }
        const address = await Address.find(queryObj);
        return ResponseGenerator.generateResponse(200, {address});
    } catch (err) {
        console.error(err);
        return ResponseGenerator.generateResponse(400, {message: err.message});
    }
}