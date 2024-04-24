const mongoose = require('mongoose');
const StudentPaymentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    payments: [
        {
            date: {
                type: Date,
                
            },
            classes: [
                {
                    date: {
                        type: Date,
                    },
                    status: {
                        type: String,
                        default: 'await',
                    }
                }
            ],
            status: {
                type: String,
                default: 'inprogress',

            }
        }
    ]
})
module.exports = mongoose.model('StudentPayment', StudentPaymentSchema)