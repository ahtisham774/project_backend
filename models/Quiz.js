const mongoose = require('mongoose');
const quizSchema = new mongoose.Schema({
    questions: {
        type: [questionSchema],
        required: true,
    },
    
    Level:{
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});
const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;