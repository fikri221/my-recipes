const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);

const leadersSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    designation: {
        type: String,
        required: true,
    },
    abbr: {
        type: String,
        required: true,
    },
    featured: {
        type: Boolean,
        default: false,
    }
},
    {
        timestamps: true
    });

let Leaders = mongoose.model('Leader', leadersSchema);

module.exports = Leaders;