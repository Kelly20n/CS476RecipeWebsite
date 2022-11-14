require('dotenv').config();
const Koa = require('koa');
const Recipe = require('../model/recipe.js');
const Comment = require('../model/comments.js');
const Router = require('koa-router');
const jwt = require('jsonwebtoken');

const route = Router();

route.get('/', async (ctx, next) => {
    // console.log('connected to root route');
    return Recipe.find({}).then(async function(results) {
        //console.log(results);
        await ctx.render('index', {
            posts: results,
            name: process.env.NAME
        });
    });
});

route.get('/view/:id', async (ctx, next) => {
    console.log('connected to recipe route');
    return Recipe.findById(ctx.params.id).then(async function(results) {
        console.log(results)
        var commentsOnPosts = await Comment.find({postId: ctx.params.id});
        console.log("Comments: " + commentsOnPosts);
        await ctx.render('recipe', {
            post: results,
            comments: commentsOnPosts
        });
    });
});

route.post('/view/:id', async (ctx, next) => {
    return jwt.verify(ctx.cookies.get('token'), process.env.TOKEN_SECRET, async (err, info) => {
        if(err){
            console.log('Not valid token!')
            return await ctx.redirect('/login')
        }
        else {
            console.log(info)
        }
       
        if(ctx.request.body.userComment === '')
        {
            return Recipe.findById(ctx.params.id).then(async function(results) {
                console.log(results)
                var commentsOnPosts = await Comment.find({postId: ctx.params.id});
                console.log("Comments: " + commentsOnPosts);
                await ctx.render('recipe', {
                    post: results,
                    comments: commentsOnPosts
                });
            });
        }
        else{
            return Recipe.findById(ctx.params.id).then(async function(results) {
                var newComment = new Comment({
                    postId: ctx.params.id,
                    commentBody: ctx.request.body.userComment,
                });
                newComment.save();
                await new Promise(r => setTimeout(r, 1000));
                var commentsOnPosts = await Comment.find({postId: ctx.params.id});
                console.log("Comments: " + commentsOnPosts);
                await ctx.render('recipe', {
                    post: results,
                    comments: commentsOnPosts
                });
            
            });
        }
    });
});

route.post('/public/search', async (ctx, next) => {
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