const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bannedSchema = new Schema({
    username: String,
    password: String,
    isAdmin: Boolean,
    name: String
});

const Banned = mongoose.model('banneds', bannedSchema);

module.exports = Banned;