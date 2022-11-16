const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lunchSchema = new Schema({
    title: String,
    ingredients: String,
    instructions: String
});

const Lunch = mongoose.model('lunchposts', lunchSchema);

module.exports = Lunch;