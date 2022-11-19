require('dotenv').config();
const Koa = require('koa');

const Breakfast = require('../model/breakfast.js');
const Lunch = require('../model/lunch.js');
const Supper = require('../model/supper.js');

const jwt = require('jsonwebtoken');
const alert = require('alert');

function createToken(ctx) {
    const secret = process.env.TOKEN_SECRET;
    const jwtToken = jwt.sign(ctx.request.body, secret, {expiresIn: 60 * 60})
    ctx.cookies.set('token', jwtToken)
    return;
}

function verifyUser(ctx) {
    var bool = true;
    jwt.verify(ctx.cookies.get('token'), process.env.TOKEN_SECRET, async (err, info) => {
        if(err){
            console.log('Not valid token!')
            bool = false;
            alert('Please sign in to complete this action');
            return await ctx.redirect('/login')
        } else {
            console.log(info);
        }
    });
    console.log(bool);
    return bool;
}

async function searchSingleDataBase(ctx, results, database) {
            console.log(database);
            if(results === null)
            {
                return await ctx.redirect('/')
            }
            else if(ctx.request.body.searchAlgorithm == 'title')
            {
                // Iterate through items from db
                console.log(ctx.request.body.searchTerms);
                var isTitleInEntry = false;
                for(var i = 0; i < results.length; i++)
                {
                    if(results[i].title == ctx.request.body.searchTerms)
                    {
                        isTitleInEntry = true;
                    }
                    if(!isTitleInEntry)
                    {
                        results.splice(i, 1);
                        i--;
                        // Removes item from results and decrements i to make algorithm look at index i again (new value now in the place)
                    }
                    isTitleInEntry = false;
                }
                console.log("Database: " + database);
                return await ctx.render('search', {
                    searchTerm: ctx.request.body.searchTerms,
                    posts: results,
                    databaseUsed: database
                });
            }
            else if (ctx.request.body.searchAlgorithm == 'ingredients')
            {
                //Turns search terms seperated by commas into an array
                var searchTerm_Array = ctx.request.body.searchTerms.split(/\s*,\s*/);
                console.log("Search Terms: " + searchTerm_Array);
                let isIngredientInEntry = false;
                var dbIngredients;
                var listOfIngredientsToRemove = [];
                // Iterate through items from db
                loop0:
                for(var i = 0; i < results.length; i++)
                {
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
                                isIngredientInEntry = true;
                            }
                        }

                    }
                    if(!isIngredientInEntry)
                    {
                        results.splice(i, 1);
                        i--;
                        // Removes item from results and decrements i to make algorithm look at index i again (new value now in the place)
                    }
                    isIngredientInEntry = false;
                }
                console.log("Database: " + database);
                return await ctx.render('search', {
                    searchTerm: ctx.request.body.searchTerm,
                    posts: results,
                    databaseUsed: database,
                });
            }
}

function returnPostsAllDatabases(ctx){
    return Breakfast.find({title: ctx.request.body.searchTerms}).then(async function(results1) {
        return Lunch.find({title: ctx.request.body.searchTerms}).then(async function(results2) {
            return Supper.find({title: ctx.request.body.searchTerms}).then(async function(results3) {
                var results = results1 + results2 + results3;
                console.log(results);

                return await ctx.render('search', {
                    searchTerm: ctx.request.body.searchTerms,
                    posts: results,
                });
            });
        });
    });
}

function decodeUser(ctx) {
    if(ctx.cookies.get("token") != null) {
        const decoded = jwt.decode(ctx.cookies.get("token"), {complete: true});
        const payload = decoded.payload;
        return payload;
    }
    else return false
}

async function displayNoDBinfo(ctx, loggedUser, page) {
    await ctx.render(page, {
        admin: loggedUser
    })
}

async function sleep() {
    return await new Promise(r => setTimeout(r, 1000));
}

module.exports.createToken = createToken;
module.exports.verifyUser = verifyUser;
module.exports.sleep = sleep;
module.exports.searchSingleDataBase = searchSingleDataBase;
module.exports.returnPostsAllDatabases = returnPostsAllDatabases;
module.exports.decodeUser = decodeUser;
module.exports.displayNoDBinfo = displayNoDBinfo;