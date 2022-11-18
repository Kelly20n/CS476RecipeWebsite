require('dotenv').config();
const Koa = require('koa');

const Upload = require('../gridfs/storage.js');
const Breakfast = require('../model/breakfast.js');
const Lunch = require('../model/lunch.js');
const Supper = require('../model/supper.js');
const Recipe = require('../model/recipe.js');
const User = require('../model/user.js');
const Router = require('koa-router');
const RecipeFunctions = require('../functions/recipefunctions.js')
const GeneralFunctions = require('../functions/generalfunctions.js')
const toBeApproved = require('../model/approval.js');



const route = Router();

route.get('/', async (ctx, next) => {
    const payload = GeneralFunctions.decodeUser(ctx)
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
        console.log(loggedUser);
        const page = 'index';
        return RecipeFunctions.displayPostTitles(ctx, loggedUser, page);
    });
});     

route.get('/views/breakfast', async (ctx, next) => {
    const payload = GeneralFunctions.decodeUser(ctx)
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
        console.log(loggedUser);
        const page = 'breakfastpage';
        return RecipeFunctions.displayBreakfastPostTitles(ctx, loggedUser, page);
    });
});    

route.get('/views/lunch', async (ctx, next) => {
    const payload = GeneralFunctions.decodeUser(ctx)
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
        console.log(loggedUser);
        const page = 'lunchpage';
        return RecipeFunctions.displayLunchPostTitles(ctx, loggedUser, page);
    });
}); 

route.get('/views/supper', async (ctx, next) => {
    const payload = GeneralFunctions.decodeUser(ctx)
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
        console.log(loggedUser);
        const page = 'supperpage';
        return RecipeFunctions.displaySupperPostTitles(ctx, loggedUser, page);
    });
}); 

route.get('/view/:id/:db/:check', async (ctx, next) => {
    const payload = GeneralFunctions.decodeUser(ctx)
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
        const page = 'recipe';
        console.log("db: " + ctx.params.db);
        return RecipeFunctions.displayPostAndComments(ctx, loggedUser, page, ctx.params.db);
    });
});

route.post('/view/:id/:db/:check', async (ctx, next) => {
    if(GeneralFunctions.verifyUser(ctx) === true)
    {
        const payload = GeneralFunctions.decodeUser(ctx)
        return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
            const page = 'recipe';
            console.log(page);
            //console.log("db: " + ctx.params.db);
            if(ctx.request.body.userComment === '') {
                console.log(loggedUser);
                return RecipeFunctions.displayPostAndComments(ctx, loggedUser, page);
            }
            else {
                RecipeFunctions.createComment(ctx, loggedUser.name);
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
    if(ctx.request.body.database == "breakfast")
    {
        var newBreakfast = new Breakfast({
            title: ctx.request.body.recipeTitle,
            ingredients: ctx.request.body.recipeIngredients,
            instructions: ctx.request.body.recipeInstructions,
            type: ctx.request.body.database,
            checked: 0
        });   
        newBreakfast.save((err, res) => {
            if(err) return handleError(err);
            else return console.log("Result: ", res)
        });
        var newToBeApproved = new toBeApproved({
            title: ctx.request.body.recipeTitle,
            ingredients: ctx.request.body.recipeIngredients,
            instructions: ctx.request.body.recipeInstructions,
            type: ctx.request.body.database,
            checked: 1
        });   
        newToBeApproved.save((err, res) => {
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
            type: ctx.request.body.database,
            checked: 0
        }); 
        newLunch.save((err, res) => {
            if(err) return handleError(err);
            else return console.log("Result: ", res)
         });
         var newToBeApproved = new toBeApproved({
            title: ctx.request.body.recipeTitle,
            ingredients: ctx.request.body.recipeIngredients,
            instructions: ctx.request.body.recipeInstructions,
            type: ctx.request.body.database,
            checked: 1
        });   
        newToBeApproved.save((err, res) => {
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
            type: ctx.request.body.database,
            checked: 0
        });
        newSupper.save((err, res) => {
            if(err) return handleError(err);
            else return console.log("Result: ", res)
        });
        var newToBeApproved = new toBeApproved({
            title: ctx.request.body.recipeTitle,
            ingredients: ctx.request.body.recipeIngredients,
            instructions: ctx.request.body.recipeInstructions,
            type: ctx.request.body.database,
            checked: 1
        });   
        newToBeApproved.save((err, res) => {
            if(err) return handleError(err);
            else return console.log("Result: ", res)
        });
        console.log('supper added');
        await ctx.redirect('postPage');
    }

    const payload = GeneralFunctions.decodeUser(ctx);
    const page = 'postPage'
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
        return GeneralFunctions.displayNoDBinfo(ctx, loggedUser, page);
    })
});

//get and post for approval page
route.get('/approval', async (ctx, next) => {
    if(GeneralFunctions.verifyUser(ctx) === true){
        const payload = GeneralFunctions.decodeUser(ctx);
        return User.findOne({username: payload.userEmail}).then(async function(loggedUser){
            return toBeApproved.find({}).then(async function(results) {
                await ctx.render('approval',{
                    posts: results,
                    admin: loggedUser
                });    
            });
        });
    }
    else return;    
});

//post for delete
route.post('/remove/:id', async (ctx, next) => {
    const doc = await toBeApproved.findOneAndRemove({title: ctx.params.id});
    if(doc.type == "breakfast")
    {
        await Breakfast.findOneAndRemove({title: ctx.params.id});
    }
    else if(doc.type == "lunch")
    {
        await Lunch.findOneAndRemove({title: ctx.params.id});
    }
    else
    {
        await Supper.findOneAndRemove({title: ctx.params.id});
    }
    console.log('Removed Document');
    await ctx.redirect('/approval');
});

route.post('/approval/:id', async (ctx, next) => {
    await toBeApproved.findByIdAndRemove(ctx.params.id);
    console.log('Removed Document');
    await ctx.redirect('/approval');
});



route.post('/search', async (ctx, next) => {
    /*return Recipe.find({title: ctx.request.body.searchTerm}).then(async function(results){*/
    //GeneralFunctions.returnPostsAllDatabases(ctx);
    
    if(ctx.request.body.searchAlgorithm == "title")
    {
        return Breakfast.find({}).then(async function(results1) {
            return Lunch.find({}).then(async function(results2) {
                return Supper.find({}).then(async function(results3) {
                    
                    //var results;
                    
                    var isTitleInEntry = false;
                    
                    
                    for(var i = 0; i < results1.length; i++)
                    {
                        //console.log(results1[i]);

                        if(results1[i].title == undefined)
                        {
                            results1.splice(i, 1);
                            //i--;
                            continue;
                        }
                        if(results1[i].title.toLowerCase() == ctx.request.body.searchTerms.toLowerCase())
                        {
                            //console.log("Hit" + results1);
                            isTitleInEntry = true;
                        }
                        if(!isTitleInEntry)
                        {
                            //console.log("Removed " + searchTerm_Array + " wasn't found: " + results1[i]);
                            //listOfIngredientsToRemove += i;
                            results1.splice(i, 1);
                            i--;
                            // Removes item from results and decrements i to make algorithm look at index i again (new value now in the place)
                        }
                        isTitleInEntry = false;
                    }
                    for(var i = 0; i < results2.length; i++)
                    {
                        //console.log(results2[i]);
                        //console.log(results2[i].title + " vs. " + ctx.request.body.searchTerms)
                        //console.log(results2[i].title.toLowerCase() + " vs. " + ctx.request.body.searchTerms.toLowerCase());
                        if(results2[i].title == undefined)
                        {
                            results2.splice(i, 1);
                            //i--;
                            continue;
                        }
                        if(results2[i].title.toLowerCase() == ctx.request.body.searchTerms.toLowerCase())
                        {
                            //console.log("Hit" + results1);
                            isTitleInEntry = true;
                        }
                        if(!isTitleInEntry)
                        {
                            //console.log("Removed " + searchTerm_Array + " wasn't found: " + results1[i]);
                            //listOfIngredientsToRemove += i;
                            results2.splice(i, 1);
                            i--;
                            // Removes item from results and decrements i to make algorithm look at index i again (new value now in the place)
                        }
                        isTitleInEntry = false;
                    }
                    for(var i = 0; i < results3.length; i++)
                    {
                        //console.log(results3[i]);
                        //console.log(results3[i].title + " vs. " + ctx.request.body.searchTerms)
                        //console.log(results3[i].title.toLowerCase() + " vs. " + ctx.request.body.searchTerms.toLowerCase());
                        if(results3[i].title == undefined)
                        {
                            results3.splice(i, 1);
                            //i--;
                            continue;
                        }
                        if(results3[i].title.toLowerCase() == ctx.request.body.searchTerms.toLowerCase())
                        {
                            //console.log("Hit" + results1);
                            isTitleInEntry = true;
                        }
                        if(!isTitleInEntry)
                        {
                            //console.log("Removed " + searchTerm_Array + " wasn't found: " + results1[i]);
                            //listOfIngredientsToRemove += i;
                            results3.splice(i, 1);
                            i--;
                            // Removes item from results and decrements i to make algorithm look at index i again (new value now in the place)
                        }
                        isTitleInEntry = false;
                    }
                    //results = results1 + results2 + results3;
                    //console.log(results);
                    return await ctx.render('search', {
                        searchTerm: ctx.request.body.searchTerms,
                        posts1: results1,
                        posts2: results2,
                        posts3: results3,
                    });

                });
            });
        });
    }
    else{
        
        return Breakfast.find({}).then(async function(results1) {
            return Lunch.find({}).then(async function(results2) {
                return Supper.find({}).then(async function(results3) {
                    console.log("Ingredients!");
                    //var results = results1 + results2 + results3;
                    //console.log(results);

                    var searchTerms = ctx.request.body.searchTerms.split(/\s*,\s*/);
                    var isIngredient = false;
                    for(var i = 0; i < results1.length; i++)
                    {
                        if(results1[i].ingredients == undefined)
                        {
                            results1.splice(i, 1);
                            continue;
                        }
                        var dbIngredients = results1[i].ingredients.split(/\s*,\s*/);
                        for(var j = 0; j < searchTerms.length; j++)
                        {
                            for(var k = 0; k < dbIngredients.length; k++)
                            {
                                //console.log(searchTerms[i].toLowerCase() + " vs. " + dbIngredients[k].toLowerCase());
                                if(searchTerms[j].toLowerCase() == dbIngredients[k].toLowerCase())
                                {
                                    isIngredient = true;
                                }
                            }
                        }
                        if(!isIngredient)
                        {
                            results1.splice(i, 1);
                            i--;
                        }
                        isIngredient = false;
                    }
                    for(var i = 0; i < results2.length; i++)
                    {
                        if(results2[i].ingredients == undefined)
                        {
                            results2.splice(i, 1);
                            continue;
                        }
                        var dbIngredients = results2[i].ingredients.split(/\s*,\s*/);
                        for(var j = 0; j < searchTerms.length; j++)
                        {
                            for(var k = 0; k < dbIngredients.length; k++)
                            {
                                //console.log(searchTerms[i].toLowerCase() + " vs. " + dbIngredients[k].toLowerCase());
                                if(searchTerms[j].toLowerCase() == dbIngredients[k].toLowerCase())
                                {
                                    
                                    isIngredient = true;
                                }
                            }
                        }
                        if(!isIngredient)
                        {
                            results2.splice(i, 1);
                            i--;
                        }
                        isIngredient = false;
                    }
                    for(var i = 0; i < results3.length; i++)
                    {
                        if(results3[i].ingredients == undefined)
                        {
                            results3.splice(i, 1);
                            continue;
                        }
                        var dbIngredients = results3[i].ingredients.split(/\s*,\s*/);
                        for(var j = 0; j < searchTerms.length; j++)
                        {
                            for(var k = 0; k < dbIngredients.length; k++)
                            {
                                //console.log(searchTerms[i].toLowerCase() + " vs. " + dbIngredients[k].toLowerCase());
                                if(searchTerms[j].toLowerCase() == dbIngredients[k].toLowerCase())
                                {
                                    
                                    isIngredient = true;
                                }
                            }
                        }
                        if(!isIngredient)
                        {
                            results3.splice(i, 1);
                            i--;
                        }
                        isIngredient = false;
                    }

                    return await ctx.render('search', {
                        searchTerm: ctx.request.body.searchTerms,
                        posts1: results1,
                        posts2: results2,
                        posts3: results3,
                    });

                });
            });
        });
    }
    
    //console.log("Results: " + results);
    
    /*
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
    */
});

route.post('/upload', Upload.single('file'), (ctx, next) => {
    console.log(ctx.request.file);
    console.log(ctx.file);
})

route.get('/uploadtest', async (ctx, next) => {
    await ctx.render('uploadtest')
});

module.exports = route;