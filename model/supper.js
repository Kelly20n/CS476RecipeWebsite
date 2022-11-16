const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const supperSchema = new Schema({
    title: String,
    ingredients: String,
    instructions: String
});

const Supper = mongoose.model('supperposts', supperSchema);

module.exports = Supper;