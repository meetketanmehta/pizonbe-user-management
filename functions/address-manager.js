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
        const address = new Address(requestBody);
        const decodedUser = await jwt.verify(event.headers.authorizationToken, process.env.JWT_SECRET);
        if (address.userId !== decodedUser.userId) {
            return ResponseGenerator.generateResponse(401, {message: "Authorization Error"});
        }
        const userAddresses = await Address.find({userId: address.userId});
        if (userAddresses !== null && address.userType !== 'customer') {
            return ResponseGenerator.generateResponse(400, {message: "Address already added in" +
                    " database, Please use modify address option"});
        }
        await address.save();
        return ResponseGenerator.generateResponse(200, {message: "Address added successfully"});
    } catch (err) {
        return ResponseGenerator.generateResponse(500, {message: err.message});
    }
}