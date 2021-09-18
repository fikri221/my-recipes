const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let User = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        unique: true
    },
    admin: {
        typeof: Boolean,
        default: false
    }
},
    {
        timestamps: true
    });

module.exports = mongoose.model('User', User);