const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
//const bcrypt = require('bcrypt');

const userAuthSchema = new mongoose.Schema({
    userType: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        min : 1000000000,
        max : 9999999999
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

userAuthSchema.methods.matchPassword = async function (userDetails) {
    return this.password === userDetails.password;
    //return await bcrypt.compare(userDetails.password, this.password);
}

userAuthSchema.methods.generateToken = async function () {
    const payload = {
        userId: this._id,
        userType: this.userType
    }
    return await jwt.sign(payload, process.env.JWT_SECRET);
}

// userAuthSchema.pre('save', function (next) {
//     const user = this;
//     bcrypt.hash(user.password, 10, function (err, encryptedPassword) {
//         if(err)
//             throw err;
//         user.password = encryptedPassword;
//         next();
//     });
// });

var UserAuth = mongoose.model('UserAuth', userAuthSchema, process.env.USER_CRED_COLLECTION);

module.exports = UserAuth;