const mongoose = require("mongoose")

const lessonSchema = new mongoose.Schema({
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
    materials:[
        {
            type: String,        
        }
    ],
    games:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }],

})

const Lesson = mongoose.model('Lesson', lessonSchema);
module.exports=Lesson;