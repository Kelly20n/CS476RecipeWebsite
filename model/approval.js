const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const toBeApprovedSchema = new Schema({
    title: String,
    ingredients: String,
    instructions: String,
    type: String,
    checked: Number
});

const toBeApproved = mongoose.model('tobeapproveds', toBeApprovedSchema);

module.exports = toBeApproved;