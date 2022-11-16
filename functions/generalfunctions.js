require('dotenv').config();
const Koa = require('koa');

const Breakfast = require('../model/breakfast.js');
const Lunch = require('../model/lunch.js');
const Supper = require('../model/supper.js');

const jwt = require('jsonwebtoken');

function verifyUser(ctx) {
    var bool = true;
    jwt.verify(ctx.cookies.get('token'), process.env.TOKEN_SECRET, async (err, info) => {
        if(err){
            console.log('Not valid token!')
            bool = false;
            return await ctx.redirect('/login')
        } else {
            console.log(info);
        }
    });
    console.log(bool);
    return bool;
}

async function searchSingleDataBase(ctx, results, database) {
    //console.log(results);    
            //console.log(ctx.request.body.searchIngredients);
            //console.log("AMOGUS: " + ctx.request.body.searchAlgorithm);
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
                        //console.log("Hit on: " + searchTerm_Array[j] + results[i])
                        isTitleInEntry = true;
                        //break loop1;
                    }
                    if(!isTitleInEntry)
                    {
                        //console.log("Removed " + searchTerm_Array + " wasn't found: " + results[i]);
                        //listOfIngredientsToRemove += i;
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
                console.log("Database: " + database);
                return await ctx.render('search', {
                    searchTerm: ctx.request.body.searchTerm,
                    posts: results,
                    databaseUsed: database,
                });
            }
}



/*
function checkAllDatabases(){
    var allDataResults;
    allDataResults += Breakfast.find({}).then(async function(results) {
        allDataResults += results;
        console.log("in function" + allDataResults);
    });
    allDataResults += Lunch.find({}).then(async function(results) {
        allDataResults += results;
        console.log("in function" + allDataResults);
    });
    allDataResults += Supper.find({}).then(async function(results) {
        allDataResults += results;
        console.log("in function" + allDataResults);
    });
    
    return allDataResults;
}
*/
async function sleep() {
    await new Promise(r => setTimeout(r, 1000));
    return;
}
module.exports.verifyUser = verifyUser;
module.exports.sleep = sleep;
module.exports.searchSingleDataBase = searchSingleDataBase;