require('dotenv').config();
const Koa = require('koa');

const Breakfast = require('../model/breakfast.js');
const Lunch = require('../model/lunch.js');
const Supper = require('../model/supper.js');
const Recipe = require('../model/recipe.js');

const User = require('../model/user.js');
const Router = require('koa-router');
const RecipeFunctions = require('../functions/recipefunctions.js')
const GeneralFunctions = require('../functions/generalfunctions.js')
const jwt = require('jsonwebtoken');


const route = Router();

route.get('/', async (ctx, next) => {
    const payload = GeneralFunctions.decodeUser(ctx)
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
        console.log(loggedUser);
        const page = 'index';
        return RecipeFunctions.displayPostTitles(ctx, loggedUser, page);
    });
});     

route.get('/view/:id', async (ctx, next) => {
    const payload = GeneralFunctions.decodeUser(ctx)
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
        const page = 'recipe';
        return RecipeFunctions.displayPostAndComments(ctx, loggedUser, page);
    });
});

route.post('/view/:id', async (ctx, next) => {
    if(GeneralFunctions.verifyUser(ctx) === true)
    {
        const payload = GeneralFunctions.decodeUser(ctx)
        return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
            const page = 'recipe';
            if(ctx.request.body.userComment === '') {
                return RecipeFunctions.displayPostAndComments(ctx, loggedUser, page);
            }
            else {
                
                RecipeFunctions.createComment(ctx);
                GeneralFunctions.sleep();
                return RecipeFunctions.displayPostAndComments(ctx, loggedUser, page);
            }
        });
    }
    else return
});
        

route.get('/postPage', async (ctx, next) => {
    const payload = GeneralFunctions.decodeUser(ctx);
    const page = 'postPage'
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
        return GeneralFunctions.displayNoDBinfo(ctx, loggedUser, page);
    })
});
    
route.post('/postPage', async (ctx, next) => {
    
    var newRecipe = new Recipe({
        title: ctx.request.body.recipeTitle,
        ingredients: ctx.request.body.recipeIngredients,
        instructions: ctx.request.body.recipeInstructions,
    });

    newRecipe.save((err, res) => {
        if(err) return handleError(err);
        else return console.log("Result: ", res)
    });

    const payload = GeneralFunctions.decodeUser(ctx);
    const page = 'postPage'
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
        return GeneralFunctions.displayNoDBinfo(ctx, loggedUser, page);
    })
});

route.post('/search', async (ctx, next) => {
    /*return Recipe.find({title: ctx.request.body.searchTerm}).then(async function(results){*/
    if(ctx.request.body.database == "breakfast")
    {
        console.log('Breakfast');
        return Breakfast.find({}).then(async function(breakfastResults){
            //console.log("about to be in func" + breakfastResults);
            //console.log("Space");
            return GeneralFunctions.searchSingleDataBase(ctx, breakfastResults, "Breakfast");    
        });
    }
    else if(ctx.request.body.database == "lunch")
    {
        console.log('Lunch');
        return Lunch.find({}).then(async function(lunchResults){    
            //console.log(ctx.request.body.searchIngredients);
            //console.log("AMOGUS: " + ctx.request.body.searchAlgorithm);
            //console.log("about to be in func" + lunchResults);
            //console.log("Space");
            return GeneralFunctions.searchSingleDataBase(ctx, lunchResults, "Lunch");
        });
    }
    else{
        console.log('Supper');
        return Supper.find({}).then(async function(supperResults){    
            //console.log(ctx.request.body.searchIngredients);
            //console.log("AMOGUS: " + ctx.request.body.searchAlgorithm);
            //console.log("about to be in func" + supperResults);
            //console.log("Space");
            return GeneralFunctions.searchSingleDataBase(ctx, supperResults, "Supper");
        });
    }
});

module.exports = route;