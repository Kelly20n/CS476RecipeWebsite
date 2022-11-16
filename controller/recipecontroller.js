require('dotenv').config();
const Koa = require('koa');

const Breakfast = require('../model/breakfast.js');
const Lunch = require('../model/lunch.js');
const Supper = require('../model/supper.js');
const Recipe = require('../model/recipe.js');

const User = require('../model/user.js');
const Router = require('koa-router');
const CommentFunctions = require('../functions/commentfunctions.js')
const GeneralFunctions = require('../functions/generalfunctions.js')
const jwt = require('jsonwebtoken');


const route = Router();

route.get('/', async (ctx, next) => {

    // return Supper.find({}).then(async function(results) {
    //     console.log(results);
    // });
    // console.log('connected to root route');
    //console.log(GeneralFunctions.checkAllDatabases);
    if(ctx.cookies.get("token") != null) {
        const decoded = jwt.decode(ctx.cookies.get("token"), {complete: true});
        const payload = decoded.payload
        return User.findOne({username: payload.userEmail}).then(async function(firstresults) {
            return Recipe.find({}).then(async function(results) {
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
    
    var newRecipe = new Recipe({
        title: ctx.request.body.recipeTitle,
        ingredients: ctx.request.body.recipeIngredients,
        instructions: ctx.request.body.recipeInstructions,
    });

    newRecipe.save((err, res) => {
        if(err) return handleError(err);
        else return console.log("Result: ", res)
    });
});

route.post('/search', async (ctx, next) => {
    /*return Recipe.find({title: ctx.request.body.searchTerm}).then(async function(results){*/
    if(ctx.request.body.database == "breakfast")
    {
        console.log('Breakfast');
        return Breakfast.find({}).then(async function(results){
            console.log(results);
            return GeneralFunctions.searchSingleDataBase(ctx, results);    
        });
    }
    else if(ctx.request.body.database == "lunch")
    {
        console.log('Lunch');
        return Lunch.find({}).then(async function(results){    
            //console.log(ctx.request.body.searchIngredients);
            //console.log("AMOGUS: " + ctx.request.body.searchAlgorithm);
            console.log(results);
            return GeneralFunctions.searchSingleDataBase(ctx, results);
        });
    }
    else{
        console.log('Supper');
        return Supper.find({}).then(async function(results){    
            //console.log(ctx.request.body.searchIngredients);
            //console.log("AMOGUS: " + ctx.request.body.searchAlgorithm);
            console.log(results);
            return GeneralFunctions.searchSingleDataBase(ctx, results);
        });
    }
});

module.exports = route;