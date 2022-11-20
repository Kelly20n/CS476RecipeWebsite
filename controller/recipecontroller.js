require('dotenv').config();
const Upload = require('../gridfs/storage.js');
const Breakfast = require('../model/breakfast.js');
const Lunch = require('../model/lunch.js');
const Supper = require('../model/supper.js');
const Comment = require('../model/comments.js')
const User = require('../model/user.js');
const Router = require('koa-router');
const Comments = require('../model/comments.js')
const RecipeFunctions = require('../functions/recipefunctions.js')
const GeneralFunctions = require('../functions/generalfunctions.js')
const toBeApproved = require('../model/approval.js');
const mongoose = require('mongoose');

const host = process.env.host;
const conn = mongoose.createConnection(host);

const route = Router();

//route get for main/home page
route.get('/', async (ctx, next) => {
    const payload = GeneralFunctions.decodeUser(ctx)
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
        const page = 'index';
        return RecipeFunctions.displayPostTitles(ctx, loggedUser, page);
    });
});

//route to get all breakfast recipes
route.get('/views/breakfast', async (ctx, next) => {
    const payload = GeneralFunctions.decodeUser(ctx)
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
        const page = 'breakfastpage';
        return RecipeFunctions.displayBreakfastPostTitles(ctx, loggedUser, page);
    });
});    

//route to get all lunch posts
route.get('/views/lunch', async (ctx, next) => {
    const payload = GeneralFunctions.decodeUser(ctx)
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
        const page = 'lunchpage';
        return RecipeFunctions.displayLunchPostTitles(ctx, loggedUser, page);
    });
}); 
//route to get all supper posts
route.get('/views/supper', async (ctx, next) => {
    const payload = GeneralFunctions.decodeUser(ctx)
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
        const page = 'supperpage';
        return RecipeFunctions.displaySupperPostTitles(ctx, loggedUser, page);
    });
}); 

//route to view a specific post with comments
route.get('/view/:id/:db/:check', async (ctx, next) => {
    const payload = GeneralFunctions.decodeUser(ctx)
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
        const page = 'recipe';
        return RecipeFunctions.displayPostAndComments(ctx, loggedUser, page, ctx.params.db);
    });
});

//route to post comment and update view of specific post
route.post('/view/:id/:db/:check', async (ctx, next) => {
    if(GeneralFunctions.verifyUser(ctx) === true)
    {
        const payload = GeneralFunctions.decodeUser(ctx)
        return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
            const page = 'recipe';
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

//route to view posts to be approved only available to the admin
route.get('/approvalview/:id/:db/:check', async (ctx, next) => {
    const payload = GeneralFunctions.decodeUser(ctx)
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
        //Check if user is admin, on the off chance they are able to get the info to attempt to view this page
        if(loggedUser.isAdmin == true) {
            const page = 'approvalview';
            return RecipeFunctions.displayPostAndComments(ctx, loggedUser, page, ctx.params.db);
        }
        else {
            await ctx.redirect('/');
        }
    });
});

//route to view a specific post to potentially delete the post or delete the comments
route.get('/approvalposts/:id/:db/:check', async (ctx, next) => {
    const payload = GeneralFunctions.decodeUser(ctx)
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
        if(loggedUser.isAdmin == true) {
            const page = 'approvalposts';
            return RecipeFunctions.displayPostAndComments(ctx, loggedUser, page, ctx.params.db);
        }
        else {
            await ctx.redirect('/');
        }
    });
});


//route post to delete a comment
route.post('/approvalposts/:id/:db/:check/:commentid', async (ctx, next) => {
    if(GeneralFunctions.verifyUser(ctx) === true)
    {
        const payload = GeneralFunctions.decodeUser(ctx)
        return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
            if(loggedUser.isAdmin === true) {
                const page = 'approvalposts';
                await Comments.findByIdAndDelete({_id: ctx.params.commentid});
            
                return RecipeFunctions.displayPostAndComments(ctx, loggedUser, page);
            }
            else {
                return await ctx.redirect("/");
            }
        });
    }
    else return
});

//route to delete a post
route.post('/approvalposts/:post_type/:post_Id', async (ctx, next) => {
    if(GeneralFunctions.verifyUser(ctx) === true)
    {
        const payload = GeneralFunctions.decodeUser(ctx)
        return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
            if(loggedUser.isAdmin === true) {
                const page = 'approvalposts';
                //find all posts by searching all collections
                return Breakfast.find({}).then(async function(results1) {
                    return Lunch.find({}).then(async function(results2) {
                        return Supper.find({}).then(async function(results3) {
                            await toBeApproved.findOneAndRemove({title: ctx.params.post_Id})
                            //if post is in the breakfast database delete it from there and all of it's comments
                            if(ctx.params.post_type == "breakfast")
                            {
                                console.log('Breakfast post removed');
                                const doc1 = await Breakfast.findOneAndRemove({title: ctx.params.post_Id});
                                await Comment.deleteMany({postId: doc1._id})
                            }
                            if(ctx.params.post_type  == "lunch")
                            {
                                console.log('Lunch post removed');
                                const doc2 = await Lunch.findOneAndRemove({title: ctx.params.post_Id});
                                await Comment.deleteMany({postId: doc2._id})
                            }
                            if(ctx.params.post_type  == "supper")
                            {
                                console.log('Supper post removed');
                                const doc3 = await Supper.findOneAndRemove({title: ctx.params.post_Id});
                                await Comment.deleteMany({postId: doc3._id})
                            }
                            ctx.redirect('/approval');
                        });
                    });
                });
            }
            else {
                return await ctx.redirect("/");
            }
        });
        
    }
    else return 
});

//route get for post page
route.get('/postPage', async (ctx, next) => {
    const payload = GeneralFunctions.decodeUser(ctx);
    const page = 'postPage'
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
        return GeneralFunctions.displayNoDBinfo(ctx, loggedUser, page);
    })
});

//route to post a recipe
route.post('/postPage', Upload.single('file'), async (ctx, next) => {
    if(GeneralFunctions.verifyUser(ctx) === true)
    {
        const payload = GeneralFunctions.decodeUser(ctx);
        return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
            if(ctx.file.contentType === 'image/jpeg' || ctx.file.contentType === 'image/png') {
                var key = false;
                //check if recipe title already exists in collections
                await Breakfast.findOne({title: ctx.request.body.recipeTitle}).then(async function(results) {
                    return Lunch.findOne({title: ctx.request.body.recipeTitle}).then(async function(results1) {
                        return Supper.findOne({title: ctx.request.body.recipeTitle}).then(async function(results2) {
                            if(results != null || results1 != null || results2 != null) {
                                key = true;
                                return await ctx.render('postpage', {
                                    admin: loggedUser,
                                    key: key
                                });
                            }
                        });
                    });
                });
                //if recipe title doesn't already exist in database
                if(key != true)
                {
                    //if statements are if the user chose the radio button corresponding to the type of recipe
                    if(ctx.request.body.database == "breakfast")
                    {
                        var newBreakfast = new Breakfast({
                            title: ctx.request.body.recipeTitle,
                            ingredients: ctx.request.body.recipeIngredients,
                            instructions: ctx.request.body.recipeInstructions,
                            type: ctx.request.body.database,
                            checked: 0,
                            image: ctx.file.filename,
                            date: new Date(),
                            user: loggedUser.name
                        });
                        newBreakfast.save((err, res) => {
                            if(err) return handleError(err);
                            else return
                        });
                        var newToBeApproved = new toBeApproved({
                            title: ctx.request.body.recipeTitle,
                            ingredients: ctx.request.body.recipeIngredients,
                            instructions: ctx.request.body.recipeInstructions,
                            type: ctx.request.body.database,
                            checked: 1,
                            image: ctx.file.filename,
                            date: new Date(),
                            user: loggedUser.name
                        });
                        newToBeApproved.save((err, res) => {
                            if(err) return handleError(err);
                            else return
                        });
                        console.log('breakfast added');
                        await ctx.redirect('/');
                    }
                    else if(ctx.request.body.database == "lunch")
                    {
                        var newLunch = new Lunch({
                            title: ctx.request.body.recipeTitle,
                            ingredients: ctx.request.body.recipeIngredients,
                            instructions: ctx.request.body.recipeInstructions,
                            type: ctx.request.body.database,
                            checked: 0,
                            image: ctx.file.filename,
                            date: new Date(),
                            user: loggedUser.name
                        });
                        newLunch.save((err, res) => {
                            if(err) return handleError(err);
                            else return
                        });
                        var newToBeApproved = new toBeApproved({
                            title: ctx.request.body.recipeTitle,
                            ingredients: ctx.request.body.recipeIngredients,
                            instructions: ctx.request.body.recipeInstructions,
                            type: ctx.request.body.database,
                            checked: 1,
                            image: ctx.file.filename,
                            date: new Date(),
                            user: loggedUser.name
                        });
                        newToBeApproved.save((err, res) => {
                            if(err) return handleError(err);
                            else return
                        });
                        console.log('lunch added');
                        await ctx.redirect('/');
                    }
                    else
                    {
                        var newSupper = new Supper({
                            title: ctx.request.body.recipeTitle,
                            ingredients: ctx.request.body.recipeIngredients,
                            instructions: ctx.request.body.recipeInstructions,
                            type: ctx.request.body.database,
                            checked: 0,
                            image: ctx.file.filename,
                            date: new Date(),
                            user: loggedUser.name
                        });
                        newSupper.save((err, res) => {
                            if(err) return handleError(err);
                            else return
                        });
                        var newToBeApproved = new toBeApproved({
                            title: ctx.request.body.recipeTitle,
                            ingredients: ctx.request.body.recipeIngredients,
                            instructions: ctx.request.body.recipeInstructions,
                            type: ctx.request.body.database,
                            checked: 1,
                            image: ctx.file.filename,
                            date: new Date(),
                            user: loggedUser.name
                        });
                        newToBeApproved.save((err, res) => {
                            if(err) return handleError(err);
                            else return
                        });
                        console.log('supper added');
                        await ctx.redirect('/');
                    }
                }
                else return
            }
            else {
                return await ctx.render('postpage', {
                    admin: loggedUser,
                    file: false
                })
            }
        });
    }
    else return
});

//route get to get all recipes that need to be approved or rejected and all recipes
route.get('/approval', async (ctx, next) => {
    if(GeneralFunctions.verifyUser(ctx) === true){
        const payload = GeneralFunctions.decodeUser(ctx);
        return User.findOne({username: payload.userEmail}).then(async function(loggedUser){
            if(loggedUser.isAdmin === true) {
                return toBeApproved.find({}).then(async function(results) {
                    return Breakfast.find({}).then(async function(results1){
                        return Lunch.find({}).then(async function(results2){
                            return Supper.find({}).then(async function(results3){
                                await ctx.render('approval', {
                                    posts: results,
                                    posts1: results1,
                                    posts2: results2,
                                    posts3: results3,
                                    admin: loggedUser
                                });
                            });
                        });
                    });
                });
            }
            else {
                return await ctx.redirect("/");
            }
            
        });
    }
    else return;
});

//route post for removal of posts based on databased
route.post('/remove/:id', async (ctx, next) => {
    const doc = await toBeApproved.findOneAndRemove({title: ctx.params.id});
    //remove post if recipe belongs to breakfast
    if(doc.type == "breakfast")
    {
        const doc1 = await Breakfast.findOneAndRemove({title: ctx.params.id});
        await Comment.deleteMany({postId: doc1._id})
    }
    //remove post if recipe belongs to lunch
    else if(doc.type == "lunch")
    {
        const doc2 = await Lunch.findOneAndRemove({title: ctx.params.id});
        await Comment.deleteMany({postId: doc2._id});
    }
     //remove post if recipe belongs to lunch
    else
    {
        const doc3 = await Supper.findOneAndRemove({title: ctx.params.id});
        await Comment.deleteMany({postId: doc3._id});
    }
    console.log('Removed Document');
    await ctx.redirect('/approval');
});

//route post to approve recipe and get rid of it from recipe that still needs to be approved
route.post('/approval/:id', async (ctx, next) => {
    await toBeApproved.findByIdAndRemove(ctx.params.id);
    console.log('Removed Document');
    await ctx.redirect('/approval');
});

//route post for searching recipe based on database
route.post('/search', async (ctx, next) => {
    ///////////////////////
    // This search algorithm is to search through either the titles (every word individually) 
    // of the database entries or the ingredients (every ingredient or word indivdually) 
    ///////////////////////
    const payload = GeneralFunctions.decodeUser(ctx);
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser){

        // If the using is wanting to search by title then this algorithm is used
        if(ctx.request.body.searchAlgorithm == "title")
        {
            // Queries for every entry in the three databases
            return Breakfast.find({}).then(async function(results1) {
                return Lunch.find({}).then(async function(results2) {
                    return Supper.find({}).then(async function(results3) {
                        
                        // Used to to control the loop of figuring out if a word in the title is in the entry
                        var isTitleInEntry = false;

                        // Used in the njk to show how many times the instance of a word in the search string has been found
                        var hitsOnSearch1 = [];

                        // Splits up the search terms into an array whenever there is a comma or a space
                        var searchTitle = ctx.request.body.searchTerms.split(/[, ]+/);
                        for(var i = 0; i < results1.length; i++)
                        {
                            hitsOnSearch1[i] = 0;

                            ////////////
                            //Detects if an entry is actually valid
                            ////////////
                            if(results1[i] == undefined)
                            {
                                results1.splice(i, 1);
                                hitsOnSearch1.splice(i, 1);
                                continue;
                            }

                            // splits up the title stored in the query from the database into an array. Seperated by commas and spaces in the title
                            var wordsInResults1Title = results1[i].title.split(/[, ]+/);
                            
                            // Double for loop to iterate through the words in the search terms and through the array from the database query
                            for(var g = 0; g < searchTitle.length; g++)
                            {
                                for(var h = 0; h < wordsInResults1Title.length; h++)
                                {
                                    // as long as the entries exist the test to see if they are equivalent takes place
                                    // needed or else will crash the program
                                    if(searchTitle[g] != undefined && wordsInResults1Title[h] != undefined)
                                    {   
                                        // compares the entries, if equivalent then it sets isTitleInEntry to true
                                        if(searchTitle[g].toLowerCase() == wordsInResults1Title[h].toLowerCase())
                                        {
                                            isTitleInEntry = true;
                                            // uses the same index as results1 to have the hitsonsearch data relate to the same index as results1
                                            hitsOnSearch1[i]++;
                                        }
                                    }
                                }
                            }
                            // if the title was not found then the entry is taken out of the array and then the for loop is set back to make up for the entry being taken out
                            // the hits corresponding to this entry is also spliced out
                            if(!isTitleInEntry)
                            {
                                results1.splice(i, 1);
                                hitsOnSearch1.splice(i, 1);
                                i--;
                            }
                            // sets to false everytime i reaches the end
                            isTitleInEntry = false;
                        }
                        // Used in the njk to show how many times the instance of a word in the search string has been found
                        var hitsOnSearch2 = [];
                        for(var i = 0; i < results2.length; i++)
                        {
                            hitsOnSearch2[i] = 0;
                            if(results2[i] == undefined)
                            {
                                results2.splice(i, 1);
                                hitsOnSearch2.splice(i, 1);
                                continue;
                            }
                            // Splits up the search terms into an array whenever there is a comma or a space
                            var wordsInResults2Title = results2[i].title.split(/[, ]+/);

                            // Double for loop to iterate through the words in the search terms and through the array from the database query
                            for(var g = 0; g < searchTitle.length; g++)
                            {
                                for(var h = 0; h < wordsInResults2Title.length; h++)
                                {
                                    // as long as the entries exist the test to see if they are equivalent takes place
                                    // needed or else will crash the program
                                    if(searchTitle[g] != undefined && wordsInResults2Title[h] != undefined)
                                    {   
                                        // compares the entries, if equivalent then it sets isTitleInEntry to true
                                        if(searchTitle[g].toLowerCase() == wordsInResults2Title[h].toLowerCase())
                                        {
                                            isTitleInEntry = true;
                                            // uses the same index as results1 to have the hitsonsearch data relate to the same index as results2
                                            hitsOnSearch2[i]++;
                                        }
                                    }
                                }
                            }
                            // if the title was not found then the entry is taken out of the array and then the for loop is set back to make up for the entry being taken out
                            // the hits corresponding to this entry is also spliced out
                            if(!isTitleInEntry)
                            {
                                results2.splice(i, 1);
                                hitsOnSearch2.splice(i, 1);
                                i--;
                            }
                            // sets to false everytime i reaches the end
                            isTitleInEntry = false;
                        }

                        // Used in the njk to show how many times the instance of a word in the search string has been found
                        var hitsOnSearch3 = [];
                        for(var i = 0; i < results3.length; i++)
                        {
                            hitsOnSearch3[i] = 0;
                            
                            ////////////
                            //Detects if an entry is actually valid
                            ////////////
                            if(results3[i] == undefined)
                            {
                                results3.splice(i, 1);
                                hitsOnSearch1.splice(i, 1);
                                continue;
                            }
                            // Splits up the search terms into an array whenever there is a comma or a space
                            var wordsInResults3Title = results3[i].title.split(/[, ]+/);

                            // Double for loop to iterate through the words in the search terms and through the array from the database query
                            for(var g = 0; g < searchTitle.length; g++)
                            {
                                for(var h = 0; h < wordsInResults3Title.length; h++)
                                {
                                    // as long as the entries exist the test to see if they are equivalent takes place
                                    // needed or else will crash the program
                                    if(searchTitle[g] != undefined && wordsInResults3Title[h] != undefined)
                                    {   
                                        // compares the entries, if equivalent then it sets isTitleInEntry to true
                                        if(searchTitle[g].toLowerCase() == wordsInResults3Title[h].toLowerCase())
                                        {
                                            isTitleInEntry = true;
                                            // uses the same index as results1 to have the hitsonsearch data relate to the same index as results3
                                            hitsOnSearch3[i]++;
                                        }
                                    }
                                }
                            }
                            // if the title was not found then the entry is taken out of the array and then the for loop is set back to make up for the entry being taken out
                            // the hits corresponding to this entry is also spliced out
                            if(!isTitleInEntry)
                            {
                                results3.splice(i, 1);
                                hitsOnSearch3.splice(i, 1);
                                i--;
                            }
                            // sets to false everytime i reaches the end
                            isTitleInEntry = false;
                        
                        }
                        console.log("Results1: " + results1 + "\nResults2: " + results2 + "\nResults3: " + results3);
                        console.log("Search1: " + hitsOnSearch1 + "\nSearch2: " + hitsOnSearch2 + "\nSearch3: " + hitsOnSearch3);
                        
                        // if one or more entry has been found it renders the results screen else it renders a specific page for no results
                        if(results1 != "" || results2 != "" || results3 != "")
                        {
                            return await ctx.render('search', {
                                searchTerm: ctx.request.body.searchTerms,
                                posts1: results1,
                                posts2: results2,
                                posts3: results3,
                                hits1: hitsOnSearch1,
                                hits2: hitsOnSearch2,
                                hits3: hitsOnSearch3,
                                admin: loggedUser
                            });
                        }   
                        else
                        {
                            return await ctx.render('searchnone', {
                                searchTerm: ctx.request.body.searchTerms,
                                admin: loggedUser
                            });
                        }
                        
                    });
                });
            });
        }
        // If the user is wanting to search by ingredient then this algorithm is used
        else{
            // Queries for every entry in the three databases
            return Breakfast.find({}).then(async function(results1) {
                return Lunch.find({}).then(async function(results2) {
                    return Supper.find({}).then(async function(results3) {
                        
                        // Splits up the search terms into an array whenever there is a comma or a space
                        var searchTerms = ctx.request.body.searchTerms.split(/[, ]+/);
                        var isIngredient = false;
                        var hitsOnSearch1 = [];
                        for(var i = 0; i < results1.length; i++)
                        {
                            hitsOnSearch1[i] = 0;
                            if(results1[i].ingredients == undefined)
                            {
                                results1.splice(i, 1);
                                hitsOnSearch1.splice(i, 1);
                                continue;
                            }
                            var dbIngredients = results1[i].ingredients.split(/[, ]+/);
                            for(var j = 0; j < searchTerms.length; j++)
                            {
                                for(var k = 0; k < dbIngredients.length; k++)
                                {
                                    var numBlanks = 0;
                                    var startingIndex = -1;
                                    for(var l = 0; l < dbIngredients[k].length; l++)
                                    {
                                        if(dbIngredients[k].charAt(l) == " ")
                                        {
                                            numBlanks++;
                                        }
                                        if(numBlanks == 2)
                                        {
                                            startingIndex = l;
                                            break;
                                        }
                                    }
                                    if(searchTerms[j].toLowerCase() == dbIngredients[k].substring(startingIndex+1, dbIngredients[k].length).toLowerCase())
                                    {
                                        hitsOnSearch1[i]++;
                                        console.log(searchTerms[j].toLowerCase() + " vs. " + dbIngredients[k].substring(startingIndex+1, dbIngredients[k].length).toLowerCase());
                                        isIngredient = true;
                                    }
                                }
                            }
                            if(!isIngredient)
                            {
                                results1.splice(i, 1);
                                hitsOnSearch1.splice(i, 1);
                                i--;
                            }
                            isIngredient = false;
                        }
                        var hitsOnSearch2 = [];
                        for(var i = 0; i < results2.length; i++)
                        {
                            hitsOnSearch2[i] = 0;
                            if(results2[i].ingredients == undefined)
                            {
                                results2.splice(i, 1);
                                hitsOnSearch2.splice(i, 1);
                                continue;
                            }
                            var dbIngredients = results2[i].ingredients.split(/[, ]+/);
                            for(var j = 0; j < searchTerms.length; j++)
                            {
                                for(var k = 0; k < dbIngredients.length; k++)
                                {

                                    var numBlanks = 0;
                                    var startingIndex = -1;
                                    for(var l = 0; l < dbIngredients[k].length; l++)
                                    {
                                        if(dbIngredients[k].charAt(l) == " ")
                                        {
                                            numBlanks++;
                                        }
                                        if(numBlanks == 2)
                                        {
                                            startingIndex = l;
                                            break;
                                        }
                                    }
                                    if(searchTerms[j].toLowerCase() == dbIngredients[k].substring(startingIndex+1, dbIngredients[k].length).toLowerCase())
                                    {
                                        hitsOnSearch2[i]++;
                                        console.log(searchTerms[j].toLowerCase() + " vs. " + dbIngredients[k].substring(startingIndex+1, dbIngredients[k].length).toLowerCase());
                                        isIngredient = true;
                                    }
                                }
                            }
                            if(!isIngredient)
                            {
                                results2.splice(i, 1);
                                hitsOnSearch2.splice(i, 1);
                                i--;
                            }
                            isIngredient = false;
                        }
                        var hitsOnSearch3 = [];
                        for(var i = 0; i < results3.length; i++)
                        {
                            hitsOnSearch3[i] = 0;
                            if(results3[i].ingredients == undefined)
                            {
                                results3.splice(i, 1);
                                continue;
                            }
                            var dbIngredients = results3[i].ingredients.split(/[, ]+/);
                            for(var j = 0; j < searchTerms.length; j++)
                            {
                                for(var k = 0; k < dbIngredients.length; k++)
                                {
                                    var numBlanks = 0;
                                    var startingIndex = -1;
                                    for(var l = 0; l < dbIngredients[k].length; l++)
                                    {
                                        if(dbIngredients[k].charAt(l) == " ")
                                        {
                                            numBlanks++;
                                        }
                                        if(numBlanks == 2)
                                        {
                                            startingIndex = l;
                                            break;
                                        }
                                    }
                                    if(searchTerms[j].toLowerCase() == dbIngredients[k].substring(startingIndex+1, dbIngredients[k].length).toLowerCase())
                                    {
                                        hitsOnSearch3[i]++;
                                        console.log(searchTerms[j].toLowerCase() + " vs. " + dbIngredients[k].substring(startingIndex+1, dbIngredients[k].length).toLowerCase());
                                        isIngredient = true;
                                    }
                                }
                            }
                            if(!isIngredient)
                            {
                                results3.splice(i, 1);
                                hitsOnSearch3.splice(i, 1);
                                i--;
                            }
                            isIngredient = false;
                        }

                        if(results1 != "" || results2 != "" || results3 != "")
                        {
                            return await ctx.render('search', {
                                searchTerm: ctx.request.body.searchTerms,
                                posts1: results1,
                                posts2: results2,
                                posts3: results3,
                                hits1: hitsOnSearch1,
                                hits2: hitsOnSearch2,
                                hits3: hitsOnSearch3,
                                admin: loggedUser
                            });
                        }   
                        else
                        {
                            return await ctx.render('searchnone', {
                                searchTerm: ctx.request.body.searchTerms,
                                admin: loggedUser
                            });
                        }
                    });
                });
            });
        }
    });
});

//route to access photos
route.get('/image/:filename', async (ctx, next) => {
    const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'fs'
    })

    const file = await bucket.find({filename: ctx.params.filename}).toArray();

    if(!file[0] || file[0].length === 0) {
        return ctx.status = 400;
    }

    if(file[0].contentType === 'image/jpeg' || file[0].contentType === 'image/png') {
        ctx.body = bucket.openDownloadStreamByName(ctx.params.filename);
        
    }
    else {
        return ctx.status = 404;
    }
})

module.exports = route;