const mongoose = require('mongoose');

const Client = mongoose.model('Client', {
    passportID: {
        type: String,
        required: true,
        unique: true,
    },
    cash: {
        type: Number,
        default: 0,
    },
    credit: {
        type: Number,
        default: 0,
    },
});

module.exports = Client;