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
const RecipeFunctions = require('../functions/recipefunctions.js')
const GeneralFunctions = require('../functions/generalfunctions.js')
const toBeApproved = require('../model/approval.js');
const mongoose = require('mongoose');
const fs = require('fs');

const host = process.env.host;
const conn = mongoose.createConnection(host);

const route = Router();

route.get('/', async (ctx, next) => {
    const payload = GeneralFunctions.decodeUser(ctx)
    console.log(payload);
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
        console.log(loggedUser);
        const page = 'index';
        return RecipeFunctions.displayPostTitles(ctx, loggedUser, page);
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

route.post('/postPage', Upload.single('file'), async (ctx, next) => {
    // console.log(ctx.request.file);

    // gfs.files.find().toArray((err, files) => {
    //     if(!files || files.length === 0) {
    //         return ctx.response.status(404);
    //     }
    //     console.log(ctx.file);

// });

    if(GeneralFunctions.verifyUser(ctx) === true)
    {
        const payload = GeneralFunctions.decodeUser(ctx);
        return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
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
                        checked: 0
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
                        checked: 1
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
                        checked: 0
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
                        checked: 1
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
                        checked: 0
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
                        checked: 1
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
        });
    }
    else return
});

//get and post for approval page
route.get('/approval', async (ctx, next) => {
    if(GeneralFunctions.verifyUser(ctx) === true){
        const payload = GeneralFunctions.decodeUser(ctx);
        return User.findOne({username: payload.userEmail}).then(async function(loggedUser){
            return toBeApproved.find({}).then(async function(results) {
                await ctx.render('approval', {
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
        const doc1 = await Breakfast.findOneAndRemove({title: ctx.params.id});
        await Comment.deleteMany({postId: doc1._id})
    }
    else if(doc.type == "lunch")
    {
        const doc2 = await Lunch.findOneAndRemove({title: ctx.params.id});
        await Comment.deleteMany({postId: doc2._id});
    }
    else
    {
        const doc3 = await Supper.findOneAndRemove({title: ctx.params.id});
        await Comment.deleteMany({postId: doc3._id});
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

route.post('/upload', Upload.single('file'), (ctx, next) => {
    // console.log(ctx.request.file);
    // console.log(ctx.file);
    ctx.redirect('/uploadtest');
})

route.get('/uploadtest', async (ctx, next) => {
    // const getFileService = async(filename) => {
        const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
            bucketName: 'fs'
        })

        let file = await bucket.find().toArray();
        console.log("Check it " + file)

        if(!file || file.length === 0) {
            return ctx.status = 400;
        }
        else {
            console.log(file);
        }
        ctx.body = file;
    // }
    // await ctx.render('uploadtest')
});

route.get('/image/:filename', async (ctx, next) => {
    const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'fs'
    })

    // let file = await bucket.find({filename: ctx.params.filename}).toArray();
    const file = await bucket.find({filename: ctx.params.filename}).toArray();
    ctx.body = file[0].contentType;
    console.log("Check it " + file)

    if(!file[0] || file[0].length === 0) {
        return ctx.status = 400;
    }

    // stream = bucket.openDownloadStreamByName(ctx.params.filename);
    // ctx.body = stream.on();
    if(file[0].contentType === 'image/jpeg' || file[0].contentType === 'img/png') {
        ctx.body = bucket.openDownloadStreamByName(ctx.params.filename);
        
    }
    else {
        return ctx.status = 404;
    }
})

module.exports = route;