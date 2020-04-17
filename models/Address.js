const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        required: true
    },
    addType: String,
    addName: {
        type: String,
        required: true
    },
    landmark: String,
    completeAdd: {
        type: String,
        required: true
    },
    coord: {
        type: {
            type: String,
            required: true
        },
        coordinates: [
            {
                type: Number,
                required: true
            }
        ]
    }
});

var Address = mongoose.model('Address', addressSchema, process.env.USER_ADDRESS_COLLECTION);

module.exports = Address;