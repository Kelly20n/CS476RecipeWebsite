const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recipeSchema = new Schema({
    title: String,
    ingredients: String,
    instructions: String
});

const Recipe = mongoose.model('recipeposts', recipeSchema);

module.exports = Recipe;