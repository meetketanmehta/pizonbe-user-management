'use strict';

const mongoose = require('mongoose');
const ResponseGenerator = require('../utils/response-generator');
const jwt = require('jsonwebtoken');
const Address = require('../models/Address');

const url = process.env.DB_HOST + "/" + process.env.USER_DB;

module.exports.addAddress = async function(event, context) {
    try {
        const connect =  mongoose.connect(url);
        const requestBody = JSON.parse(event.body);
        const decodedUser = await jwt.verify(event.headers.authorizationToken, process.env.JWT_SECRET);
        if(decodedUser.userType !== 'customer') {
            const address = await Address.findOne({userId: decodedUser.userId});
            if(address !== null) {
                return ResponseGenerator.generateResponse(400, {message: "Address already present in database"});
            }
        }
        requestBody['userId'] = decodedUser.userId;
        requestBody['userType'] = decodedUser.userType;
        requestBody['coord'] = {
            type: "Point",
            coordinates: requestBody['coordinates']
        };
        const address = new Address(requestBody);
        await connect;
        await address.save();
        return ResponseGenerator.generateResponse(200, {message: "Address added successfully"});
    } catch (err) {
        if(err.name === "TokenExpiredError" || err.name === "JsonWebTokenError" || err.name === "NotBeforeError") {
            return ResponseGenerator.generateResponse(400, err.message);
        }
        return ResponseGenerator.internalErrorResponse();
    }
}

module.exports.getAddress = async function (event, context) {
    try {
        const connect =  mongoose.connect(url);
        const decodedUser = await jwt.verify(event.headers.authorizationToken, process.env.JWT_SECRET);
        const queryObj = {
            userId: decodedUser.userId
        };
        await connect;
        let addresses = await Address.find(queryObj).lean();
        addresses.forEach((address) => {
            address['coordinates'] = address.coord.coordinates;
            delete address['coord'];
        })
        return ResponseGenerator.generateResponse(200, addresses);
    } catch (err) {
        console.error(err);
        if(err.name === "TokenExpiredError" || err.name === "JsonWebTokenError" || err.name === "NotBeforeError") {
            return ResponseGenerator.generateResponse(400, err.message);
        }
        return ResponseGenerator.internalErrorResponse();
    }
}