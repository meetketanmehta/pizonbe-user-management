const mongoose = require('mongoose');
const UserAuth = require('../models/UserAuth');
const ResponseGenerator = require('../utils/response-generator');
const jwt = require('jsonwebtoken');
const url = process.env.DB_HOST + "/" + process.env.USER_DB;
const {capitalCase} = require('case-anything');

module.exports.register = async function (event, context) {
    try {
        const requestBody = JSON.parse(event.body);
        console.log("Request body: " + JSON.stringify(requestBody));
        const newUser = new UserAuth(requestBody);
        await mongoose.connect(url);
        await newUser.save();
        const jwtToken = await newUser.generateToken();
        return ResponseGenerator.generateResponse(200, {authToken: jwtToken});
    } catch (err) {
        console.error(err);
        if(err.name === 'ValidationError') {
            let errorPaths = Object.keys(err.errors);
            errorPaths.forEach((errorPath, index, arr) => {arr[index] = capitalCase(errorPath)});
            const uniqueErrorIn = errorPaths.join(' and ');
            const responseString = uniqueErrorIn + " already registered, Please Login";
            return ResponseGenerator.generateResponse(400, {message: responseString});
        }
        return ResponseGenerator.generateResponse(500, {message: "Internal server error, Please try again later"});
    }
}

module.exports.login = async function (event, context) {
    try {
        const requestBody = JSON.parse(event.body);
        console.log("Request body: " + JSON.stringify(requestBody));
        await mongoose.connect(url);
        const dbUser = await UserAuth.findOne({emailId: requestBody.emailId});
        if(dbUser == null) {
            return ResponseGenerator.generateResponse(400, {message: "Email Id / Password is incorrect"});
        }
        const matched = await dbUser.matchPassword(requestBody);
        if(matched) {
            const jwtToken = await dbUser.generateToken();
            return ResponseGenerator.generateResponse(200, {authToken: jwtToken});
        }
        return ResponseGenerator.generateResponse(400, {message: "Email Id / Password is incorrect"});
    } catch (err) {
        console.error(err);
        return ResponseGenerator.generateResponse(500, {message: "Internal server error, Please try again later"});
    }
}

module.exports.getUserId = async function (event, context) {
    try {
        const decodedUser = await jwt.verify(event.headers.authorizationToken, process.env.JWT_SECRET);
        return ResponseGenerator.generateResponse(200, decodedUser);
    } catch (err) {
        console.error(err);
        return ResponseGenerator.generateResponse(400, err.message);
    }
}
