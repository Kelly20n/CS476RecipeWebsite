const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: String,
    password: String,
    isAdmin: Boolean,
    name: String
});

const User = mongoose.model('users', userSchema);

module.exports = User;