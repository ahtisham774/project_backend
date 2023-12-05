const mongoose = require("mongoose")

const activitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    coverImage:{
        type:String,
    },
    description: {
        type: String,

    },
    lessons:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson'        
        }
    ],
    homeworks:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Homework'
    }],
    isDone: {
        type: Boolean,
        default: false
    },

})

const Activity = mongoose.model('Activity', activitySchema);
module.exports=Activity;