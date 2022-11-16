const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const breakfastSchema = new Schema({
    title: String,
    ingredients: String,
    instructions: String
});

const Breakfast = mongoose.model('breakfastposts', breakfastSchema);

module.exports = Breakfast;