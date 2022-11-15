require('dotenv').config();
const Koa = require('koa');
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
    return Recipe.find({}).then(async function(results){    
        //console.log(ctx.request.body.searchTerm)
        // console.log(results);
        console.log(ctx.request.body.searchTerm);
        if(results === null)
        {
            await ctx.redirect('/');
        }
        else if(ctx.request.body.searchTerm === '')
        {
            await ctx.redirect('/');
        }
        else
        {
            //Turns search terms seperated by commas into an array
            var searchTerm_Array = ctx.request.body.searchTerm.split(/\s*,\s*/);
            console.log("Search Terms: " + searchTerm_Array);
            let isIngredientInEntry = false;
            var dbIngredients;
            var listOfIngredientsToRemove = [];
            // Iterate through items from db
            loop0:
            for(var i = 0; i < results.length; i++)
            {
                
                //console.log("Viewing: " + results[i].ingredients);
                //Turns ingredients in recipe tree into lists with each db entry
                dbIngredients = results[i].ingredients.split(/\s*,\s*/);

                // Iterate through each search term
                loop1:
                for(var j = 0; j < searchTerm_Array.length; j++)
                {
                    loop2:
                    for(var k = 0; k < dbIngredients.length; k++)
                    {
                        if(searchTerm_Array[j] == dbIngredients[k])
                        {
                            //console.log("Hit on: " + searchTerm_Array[j] + results[i]);
                            isIngredientInEntry = true;
                            //break loop1;
                        }
                    }

                }
                if(!isIngredientInEntry)
                {
                    //console.log("Removed " + searchTerm_Array + " wasn't found: " + results[i]);
                    //listOfIngredientsToRemove += i;
                    results.splice(i, 1);
                    i--;
                    // Removes item from results and decrements i to make algorithm look at index i again (new value now in the place)
                }
                isIngredientInEntry = false;
            }
            await ctx.render('search', {
                searchTerm: ctx.request.body.searchTerm,
                posts: results
            });
        }
    });
});

module.exports = route;