const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bannedSchema = new Schema({
    username: String
});

const Banned = mongoose.model('banneds', bannedSchema);

module.exports = Banned;