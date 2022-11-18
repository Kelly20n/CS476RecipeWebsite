require('dotenv').config();

//global variables
const Upload = require('../gridfs/storage.js');
const Breakfast = require('../model/breakfast.js');
const Lunch = require('../model/lunch.js');
const Supper = require('../model/supper.js');
const User = require('../model/user.js');
const Router = require('koa-router');
const RecipeFunctions = require('../functions/recipefunctions.js')
const GeneralFunctions = require('../functions/generalfunctions.js')
const toBeApproved = require('../model/approval.js');
const route = Router();

//route get for main/home page
route.get('/', async (ctx, next) => {
    const payload = GeneralFunctions.decodeUser(ctx)
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
        console.log(loggedUser);
        const page = 'index';
        return RecipeFunctions.displayPostTitles(ctx, loggedUser, page);
    });
});     

//route get for geting
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
                return RecipeFunctions.displayPostAndComments(ctx, loggedUser, page, ctx.params.db);
            }
            else {
                RecipeFunctions.createComment(ctx, ctx.params.db);
                GeneralFunctions.sleep();
                return RecipeFunctions.displayPostAndComments(ctx, loggedUser, page, ctx.params.db);
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
    
//route post page to post to database when recipe is posted
route.post('/postPage', async (ctx, next) => {
    //adds to breakfast database and toBeApproved for admin duties
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
    //adds to lunch database and toBeApproved for admin duties
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
    //adds to supper database and toBeApproved for admin duties
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

//route get to get all recipes that need to be approved or rejected
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

//route post for removal of posts based on databased
route.post('/remove/:id', async (ctx, next) => {
    const doc = await toBeApproved.findOneAndRemove({title: ctx.params.id});
    //remove post if recipe belongs to breakfast
    if(doc.type == "breakfast")
    {
        await Breakfast.findOneAndRemove({title: ctx.params.id});
    }
    //remove post if recipe belongs to lunch
    else if(doc.type == "lunch")
    {
        await Lunch.findOneAndRemove({title: ctx.params.id});
    }
     //remove post if recipe belongs to lunch
    else
    {
        await Supper.findOneAndRemove({title: ctx.params.id});
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
    if(ctx.request.body.database == "breakfast")
    {
        console.log('Breakfast');
        return Breakfast.find({}).then(async function(breakfastResults){
            return GeneralFunctions.searchSingleDataBase(ctx, breakfastResults, "Breakfast");    
        });
    }
    //search in lunch database
    else if(ctx.request.body.database == "lunch")
    {
        console.log('Lunch');
        return Lunch.find({}).then(async function(lunchResults){    
            return GeneralFunctions.searchSingleDataBase(ctx, lunchResults, "Lunch");
        });
    }
    //search in lunch database
    else{
        console.log('Supper');
        return Supper.find({}).then(async function(supperResults){    
            return GeneralFunctions.searchSingleDataBase(ctx, supperResults, "Supper");
        });
    }
});

//route post for upload picture files
route.post('/upload', Upload.single('file'), (ctx, next) => {
    console.log(ctx.request.file);
    console.log(ctx.file);
})

route.get('/uploadtest', async (ctx, next) => {
    await ctx.render('uploadtest')
});

module.exports = route;