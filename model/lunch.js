const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lunchSchema = new Schema({
    title: String,
    ingredients: String,
    instructions: String, 
    type: String,
    checked: Number,
    image: String,
    date: Date,
    user: String
});

const Lunch = mongoose.model('lunchposts', lunchSchema);

module.exports = Lunch;