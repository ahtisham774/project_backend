
const mongoose = require('mongoose')

const dotenv = require('dotenv');
dotenv.config();


DATABASE = process.env.DB_STRING;
mongoose.connect(DATABASE).then(() => {

    console.log('connected to database');
}
).catch((err) => {
    console.log('error connecting to database',err);
});
module.exports = mongoose