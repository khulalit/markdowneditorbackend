const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    userid : {
        type : String,
        required : true
    },
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    files : [
        {
            name : String,
            content : String
        }
    ]
},{timestamps : true,timeseries : true});

const User = mongoose.model('User', userSchema);

module.exports = User;