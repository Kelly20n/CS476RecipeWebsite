require('dotenv').config();
const Upload = require('../gridfs/storage.js');
const gfs = require('../gridfs/gfs.js');
const {GridFsStorage} = require('multer-gridfs-storage');
const Breakfast = require('../model/breakfast.js');
const Lunch = require('../model/lunch.js');
const Supper = require('../model/supper.js');
const Comment = require('../model/comments.js')
const Recipe = require('../model/recipe.js');
const User = require('../model/user.js');
const Router = require('koa-router');
const Comments = require('../model/comments.js')
const RecipeFunctions = require('../functions/recipefunctions.js')
const GeneralFunctions = require('../functions/generalfunctions.js')
const toBeApproved = require('../model/approval.js');
const mongoose = require('mongoose');
const fs = require('fs');
const { title } = require('process');

const host = process.env.host;
const conn = mongoose.createConnection(host);

const route = Router();

//route get for main/home page
route.get('/', async (ctx, next) => {
    const payload = GeneralFunctions.decodeUser(ctx)
    console.log(payload);
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
        console.log(loggedUser);
        const page = 'index';
        return RecipeFunctions.displayPostTitles(ctx, loggedUser, page);
    });
});

//route get for getting
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

route.get('/approvalview/:id/:db/:check', async (ctx, next) => {
    const payload = GeneralFunctions.decodeUser(ctx)
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
        const page = 'approvalview';
        console.log("db: " + ctx.params.db);
        return RecipeFunctions.displayPostAndComments(ctx, loggedUser, page, ctx.params.db);
    });
});

//
route.get('/approvalposts/:id/:db/:check', async (ctx, next) => {
    const payload = GeneralFunctions.decodeUser(ctx)
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
        const page = 'approvalposts';
        console.log("db: " + ctx.params.db);
        return RecipeFunctions.displayPostAndComments(ctx, loggedUser, page, ctx.params.db);
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
            console.log(page);
            console.log(ctx.params.commentid);
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


route.post('/approvalposts/:post_type/:post_Id', async (ctx, next) => {
    if(GeneralFunctions.verifyUser(ctx) === true)
    {
        const payload = GeneralFunctions.decodeUser(ctx)
        return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
            if(loggedUser.isAdmin === true) {
                const page = 'approvalposts';
                console.log(page);
                return Breakfast.find({}).then(async function(results1) {
                    return Lunch.find({}).then(async function(results2) {
                        return Supper.find({}).then(async function(results3) {
                            await toBeApproved.findOneAndRemove({title: ctx.params.post_Id})
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

route.post('/postPage', Upload.single('file'), async (ctx, next) => {
    if(GeneralFunctions.verifyUser(ctx) === true)
    {
        const payload = GeneralFunctions.decodeUser(ctx);
        console.log("right here:" + ctx.file.contentType);
        return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
            if(ctx.file.contentType === 'image/jpeg' || ctx.file.contentType === 'image/png') {
                var key = false;
                await Breakfast.findOne({title: ctx.request.body.recipeTitle}).then(async function(results) {
                    return Lunch.findOne({title: ctx.request.body.recipeTitle}).then(async function(results1) {
                        return Supper.findOne({title: ctx.request.body.recipeTitle}).then(async function(results2) {
                            console.log(results)
                            console.log(results1)
                            console.log(results2)
                            if(results != null || results1 != null || results2 != null) {
                                key = true;
                                return await ctx.render('postpage', {
                                    admin: loggedUser,
                                    key: key
                                })
                            }
                        });
                    });
                });
                if(key != true)
                {
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
                        console.log(ctx.file.filename);
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

//route get to get all recipes that need to be approved or rejected
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
    //search in breakfast database
    /*return Recipe.find({title: ctx.request.body.searchTerm}).then(async function(results){*/
    //GeneralFunctions.returnPostsAllDatabases(ctx);
    const payload = GeneralFunctions.decodeUser(ctx);
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser){
        if(ctx.request.body.searchAlgorithm == "title")
        {
            return Breakfast.find({}).then(async function(results1) {
                return Lunch.find({}).then(async function(results2) {
                    return Supper.find({}).then(async function(results3) {
                        
                        var isTitleInEntry = false;
                        var hitsOnSearch1 = [];
                        var searchTitle = ctx.request.body.searchTerms.split(/[, ]+/);
                        //console.log(searchTitle);
                        for(var i = 0; i < results1.length; i++)
                        {
                            hitsOnSearch1[i] = 0;
                            // if(results1[i] != undefined)
                            // {
                            //     var wordsInResults1Title = results1[i].title.split(' ');
                            // }
                            //console.log(wordsInResults1Title);
                            if(results1[i] == undefined)
                            {
                                results1.splice(i, 1);
                                hitsOnSearch1.splice(i, 1);
                                continue;
                            }
                            var wordsInResults1Title = results1[i].title.split(/[, ]+/);
                            // console.log(searchTitle);
                            // console.log(wordsInResults1Title);
                            for(var g = 0; g < searchTitle.length; g++)
                            {
                                for(var h = 0; h < wordsInResults1Title.length; h++)
                                {
                                    if(searchTitle[g] != undefined && wordsInResults1Title[h] != undefined)
                                    {   
                                        console.log(searchTitle[g].toLowerCase() + " vs. "+  wordsInResults1Title[h].toLowerCase());
                                        if(searchTitle[g].toLowerCase() == wordsInResults1Title[h].toLowerCase())
                                        {
                                            isTitleInEntry = true;
                                            hitsOnSearch1[i]++;
                                            //console.log(results1[i].title + " has " + hitsOnSearch1[i] + " hits!");
                                        }
                                    }
                                }
                            }
                            if(!isTitleInEntry)
                            {
                                results1.splice(i, 1);
                                hitsOnSearch1.splice(i, 1);
                                i--;
                            }
                            isTitleInEntry = false;
                        }
                        var hitsOnSearch2 = [];
                        for(var i = 0; i < results2.length; i++)
                        {
                            hitsOnSearch2[i] = 0;
                            // if(results1[i] != undefined)
                            // {
                            //     var wordsInResults1Title = results1[i].title.split(' ');
                            // }
                            //console.log(wordsInResults1Title);
                            if(results2[i] == undefined)
                            {
                                results2.splice(i, 1);
                                hitsOnSearch2.splice(i, 1);
                                continue;
                            }
                            var wordsInResults2Title = results2[i].title.split(/[, ]+/);
                            // console.log(searchTitle);
                            // console.log(wordsInResults1Title);
                            for(var g = 0; g < searchTitle.length; g++)
                            {
                                for(var h = 0; h < wordsInResults2Title.length; h++)
                                {
                                    if(searchTitle[g] != undefined && wordsInResults2Title[h] != undefined)
                                    {   
                                        console.log(searchTitle[g].toLowerCase() + " vs. "+  wordsInResults2Title[h].toLowerCase());
                                        if(searchTitle[g].toLowerCase() == wordsInResults2Title[h].toLowerCase())
                                        {
                                            isTitleInEntry = true;
                                            hitsOnSearch2[i]++;
                                            //console.log(results1[i].title + " has " + hitsOnSearch1[i] + " hits!");
                                        }
                                    }
                                }
                            }
                            if(!isTitleInEntry)
                            {
                                results2.splice(i, 1);
                                hitsOnSearch2.splice(i, 1);
                                i--;
                            }
                            isTitleInEntry = false;
                        }
                        var hitsOnSearch3 = [];
                        for(var i = 0; i < results3.length; i++)
                        {
                            hitsOnSearch3[i] = 0;
                            // if(results1[i] != undefined)
                            // {
                            //     var wordsInResults1Title = results1[i].title.split(' ');
                            // }
                            //console.log(wordsInResults1Title);
                            if(results3[i] == undefined)
                            {
                                results3.splice(i, 1);
                                hitsOnSearch1.splice(i, 1);
                                continue;
                            }
                            var wordsInResults3Title = results3[i].title.split(/[, ]+/);
                            // console.log(searchTitle);
                            // console.log(wordsInResults1Title);
                            for(var g = 0; g < searchTitle.length; g++)
                            {
                                for(var h = 0; h < wordsInResults3Title.length; h++)
                                {
                                    if(searchTitle[g] != undefined && wordsInResults3Title[h] != undefined)
                                    {   
                                        console.log(searchTitle[g].toLowerCase() + " vs. "+  wordsInResults3Title[h].toLowerCase());
                                        if(searchTitle[g].toLowerCase() == wordsInResults3Title[h].toLowerCase())
                                        {
                                            isTitleInEntry = true;
                                            hitsOnSearch3[i]++;
                                            //console.log(results1[i].title + " has " + hitsOnSearch1[i] + " hits!");
                                        }
                                    }
                                }
                            }
                            if(!isTitleInEntry)
                            {
                                results3.splice(i, 1);
                                hitsOnSearch3.splice(i, 1);
                                i--;
                            }
                            isTitleInEntry = false;
                        }
                        console.log("Search1: " + hitsOnSearch1 + "\nSearch2: " + hitsOnSearch2 + "\nSearch3: " + hitsOnSearch3);
                        return await ctx.render('search', {
                            searchTerm: ctx.request.body.searchTerms,
                            posts1: results1,
                            posts2: results2,
                            posts3: results3,
                            hits1: hitsOnSearch1,
                            hits2: hitsOnSearch2,
                            hits3: hitsOnSearch3,
                            amdin: loggedUser
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
                                        //console.log(dbIngredients);
                                        if(dbIngredients[k].charAt(l) == " ")
                                        {
                                            //console.log("Hit");
                                            numBlanks++;
                                        }
                                        if(numBlanks == 2)
                                        {
                                            startingIndex = l;
                                            break;
                                        }
                                    }
                                    //console.log(searchTerms[i].toLowerCase() + " vs. " + dbIngredients[k].toLowerCase());
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
                                        //console.log(dbIngredients);
                                        if(dbIngredients[k].charAt(l) == " ")
                                        {
                                            //console.log("Hit");
                                            numBlanks++;
                                        }
                                        if(numBlanks == 2)
                                        {
                                            startingIndex = l;
                                            break;
                                        }
                                    }
                                    //console.log(searchTerms[i].toLowerCase() + " vs. " + dbIngredients[k].toLowerCase());
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
                                    //console.log(dbIngredients[k]);
                                    //console.log(searchTerms[i].toLowerCase() + " vs. " + dbIngredients[k].toLowerCase());
                                    var numBlanks = 0;
                                    var startingIndex = -1;
                                    for(var l = 0; l < dbIngredients[k].length; l++)
                                    {
                                        //console.log(dbIngredients);
                                        if(dbIngredients[k].charAt(l) == " ")
                                        {
                                            //console.log("Hit");
                                            numBlanks++;
                                        }
                                        if(numBlanks == 2)
                                        {
                                            startingIndex = l;
                                            break;
                                        }
                                    }
                                    

                                    //console.log(dbIngredients[k].substring(startingIndex+1, dbIngredients[k].length).toLowerCase());
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

                    });
                });
            });
        }
    });
});

route.get('/image/:filename', async (ctx, next) => {
    const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'fs'
    })

    // let file = await bucket.find({filename: ctx.params.filename}).toArray();
    const file = await bucket.find({filename: ctx.params.filename}).toArray();
    
    console.log("Check it " + file)

    if(!file[0] || file[0].length === 0) {
        return ctx.status = 400;
    }

    // stream = bucket.openDownloadStreamByName(ctx.params.filename);
    // ctx.body = stream.on();
    if(file[0].contentType === 'image/jpeg' || file[0].contentType === 'image/png') {
        ctx.body = bucket.openDownloadStreamByName(ctx.params.filename);
        
    }
    else {
        return ctx.status = 404;
    }
})

module.exports = route;