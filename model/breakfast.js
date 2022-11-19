const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const breakfastSchema = new Schema({
    title: String,
    ingredients: String,
    instructions: String,
    type: String,
    checked: Number,
    image: String,
    date: Date,
    user: String
});

const Breakfast = mongoose.model('breakfastposts', breakfastSchema);

module.exports = Breakfast;