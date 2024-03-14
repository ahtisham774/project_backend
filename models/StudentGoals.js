const mongoose = require('mongoose');
const StudentGoals = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    goals: [
        {
            month: {
                type: String,
                required: true
            },
            year: {
                type: String,
                required: true
            },
            goal: [

                {
                    title: {
                        type: String,
                        required: true
                    }
                    , dueDate: {
                        type: Date,
                        default: Date.now()
                    },
                    isDone: {
                        type: Boolean,
                        default: false
                    }
                }
            ]
        }
    ]
})
module.exports = mongoose.model('StudentGoals', StudentGoals)