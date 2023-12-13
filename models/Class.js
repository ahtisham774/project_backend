
const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({

    name: {
        type: String,
    },
    description: {
        type: String,
    },
    goal: {
        type: String,
    },
    tracking: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tracking'

    }]
    ,
    isDone: {
        type: Boolean,
        default: false
    }


});

const Class = mongoose.model('Class', classSchema);

module.exports = Class;
