const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const toBeAprovedSchema = new Schema({
    postId: String,
    user: String,
    title: String,
    ingredients: String,
    instructions: String
});

const toBeAproved = mongoose.model('toBeApproved', toBeAprovedSchema);

module.exports = toBeAproved;