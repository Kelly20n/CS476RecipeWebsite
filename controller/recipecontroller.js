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

route.get('/view/:id/:db', async (ctx, next) => {
    const payload = GeneralFunctions.decodeUser(ctx)
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
        const page = 'recipe';
        console.log("db: " + ctx.params.db);
        return RecipeFunctions.displayPostAndComments(ctx, loggedUser, page, ctx.params.db);
    });
});

route.post('/view/:id/:db', async (ctx, next) => {
    if(GeneralFunctions.verifyUser(ctx) === true)
    {
        const payload = GeneralFunctions.decodeUser(ctx)
        return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
            const page = 'recipe';
            console.log("db: " + ctx.params.db);
            if(ctx.request.body.userComment === '') {
                return RecipeFunctions.displayPostAndComments(ctx, loggedUser, page, ctx.params.db);
            }
            else {
                RecipeFunctions.createComment(ctx);
                GeneralFunctions.sleep();
                return RecipeFunctions.displayPostAndComments(ctx, loggedUser, page, ctx.params.db);
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
            return GeneralFunctions.searchSingleDataBase(ctx, breakfastResults, "Breakfast");    
        });
    }
    else if(ctx.request.body.database == "lunch")
    {
        console.log('Lunch');
        return Lunch.find({}).then(async function(lunchResults){    
            return GeneralFunctions.searchSingleDataBase(ctx, lunchResults, "Lunch");
        });
    }
    else{
        console.log('Supper');
        return Supper.find({}).then(async function(supperResults){    
            return GeneralFunctions.searchSingleDataBase(ctx, supperResults, "Supper");
        });
    }
});

module.exports = route;