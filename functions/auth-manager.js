const mongoose = require('mongoose');
const UserAuth = require('../models/UserAuth');
const ResponseGenerator = require('../utils/response-generator');
const jwt = require('jsonwebtoken');
const url = process.env.DB_HOST + "/" + process.env.USER_DB;

module.exports.register = async function (event, context) {
    const requestBody = JSON.parse(event.body);
    const newUser = new UserAuth(requestBody);
    try {
        await mongoose.connect(url);
        await newUser.save();
        const jwtToken = await newUser.generateToken();
        return ResponseGenerator.generateResponse(200, {token: jwtToken});
    } catch (err) {
        return ResponseGenerator.generateResponse(400, {message: err.message});
    }
}

module.exports.login = async function (event, context) {
    const requestBody = JSON.parse(event.body);
    try {
        await mongoose.connect(url);
        const dbUser = await UserAuth.findOne({email: requestBody.email});
        if(dbUser == null) {
            return ResponseGenerator.generateResponse(400, {message: "Credentials didn't matched"});
        }
        const matched = await dbUser.matchPassword(requestBody);
        if(matched) {
            const jwtToken = await dbUser.generateToken();
            return ResponseGenerator.generateResponse(200, {token: jwtToken});
        }
        return ResponseGenerator.generateResponse(400, {message: "Credentials didn't matched"});
    } catch (err) {
        return ResponseGenerator.generateResponse(400, {message: err.message});
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
