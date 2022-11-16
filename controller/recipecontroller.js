require('dotenv').config();
const Koa = require('koa');
const Recipe = require('../model/recipe.js');
const User = require('../model/user.js');
const Router = require('koa-router');
const Breakfast = require('../model/breakfast.js');
const Lunch = require('../model/lunch.js');
const Supper = require('../model/supper.js');
const CommentFunctions = require('../functions/commentfunctions.js')
const GeneralFunctions = require('../functions/generalfunctions.js')
const jwt = require('jsonwebtoken');
const toBeAproved = require('../model/approval.js');



const route = Router();

route.get('/', async (ctx, next) => {
    // console.log('connected to root route');
    if(ctx.cookies.get("token") != null) {
        const decoded = jwt.decode(ctx.cookies.get("token"), {complete: true});
        const payload = decoded.payload
        return User.findOne({username: payload.userEmail}).then(async function(firstresults) {
            return Recipe.find({}).then(async function(results) {
                //console.log(results);
                console.log(firstresults);
                await ctx.render('index', {
                    posts: results,
                    name: process.env.NAME,
                    admin: firstresults
                });
            });
        });
    }
    else {
        return Recipe.find({}).then(async function(results) {
            //console.log(results);
            await ctx.render('index', {
                posts: results,
                name: process.env.NAME,
            });
        });
    }  
});

route.get('/view/:id', async (ctx, next) => {
    return CommentFunctions.displayComments(ctx);
});

route.post('/view/:id', async (ctx, next) => {
    if(GeneralFunctions.verifyUser(ctx) === true)
    {
        if(ctx.request.body.userComment === '') {
            return CommentFunctions.postComments(ctx);
        }
        else {
            CommentFunctions.createComment(ctx);
            GeneralFunctions.sleep();
            return CommentFunctions.displayComments(ctx);
        }
    }
    else return;
});
        

route.get('/postPage', async (ctx, next) => {
    await ctx.render('postPage');
});
    
route.post('/postPage', async (ctx, next) => {
    if(ctx.request.body.database == "breakfast")
    {
        var newBreakfast = new Breakfast({
            title: ctx.request.body.recipeTitle,
            ingredients: ctx.request.body.recipeIngredients,
            instructions: ctx.request.body.recipeInstructions,
        });   
        newBreakfast.save((err, res) => {
            if(err) return handleError(err);
            else return console.log("Result: ", res)
        });
        console.log('breakfast added');
        await ctx.redirect('postPage');
    }
    else if(ctx.request.body.database == "lunch")
    {
        var newLunch = new Lunch({
            title: ctx.request.body.recipeTitle,
            ingredients: ctx.request.body.recipeIngredients,
            instructions: ctx.request.body.recipeInstructions,
        }); 
        newLunch.save((err, res) => {
            if(err) return handleError(err);
            else return console.log("Result: ", res)
         });
         console.log('lunch added');
         await ctx.redirect('postPage');
    }
    
    else
    {
         var newSupper = new Supper({
            title: ctx.request.body.recipeTitle,
            ingredients: ctx.request.body.recipeIngredients,
            instructions: ctx.request.body.recipeInstructions,
        });
        newSupper.save((err, res) => {
            if(err) return handleError(err);
            else return console.log("Result: ", res)
        });
        console.log('supper added');
        await ctx.redirect('postPage');
    }
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