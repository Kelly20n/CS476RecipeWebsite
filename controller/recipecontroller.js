require('dotenv').config();

//global variables
const Upload = require('../gridfs/storage.js');
const Breakfast = require('../model/breakfast.js');
const Lunch = require('../model/lunch.js');
const Supper = require('../model/supper.js');
const User = require('../model/user.js');
const Router = require('koa-router');
const Comments = require('../model/comments.js')
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


//route post to delete a comment
route.post('/view/:id/:db/:check/:commentid', async (ctx, next) => {
    if(GeneralFunctions.verifyUser(ctx) === true)
    {
        const payload = GeneralFunctions.decodeUser(ctx)
        return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
            const page = 'recipe';
            console.log(page);
             console.log(ctx.params.commentid);
            await Comments.findByIdAndDelete({_id: ctx.params.commentid});
           
            return RecipeFunctions.displayPostAndComments(ctx, loggedUser, page);
        });
    }
    else return
});

route.post('/view/:id/:db/:check/:commentid', async (ctx, next) => {
    if(GeneralFunctions.verifyUser(ctx) === true)
    {
        const payload = GeneralFunctions.decodeUser(ctx)
        return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
            const page = 'recipe';
            console.log(page);
             console.log(ctx.params.commentid);
            await Comments.findByIdAndDelete({_id: ctx.params.commentid});
           
            return RecipeFunctions.displayPostAndComments(ctx, loggedUser, page);
        });
    }
    else return
});

// route.post('/view/:id/:db/:check/:postId', async (ctx, next) => {
//     if(GeneralFunctions.verifyUser(ctx) === true)
//     {
//         const payload = GeneralFunctions.decodeUser(ctx)
//         return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
//             const page = 'recipe';
//             console.log(page);
//             if(ctx.request.body.database == "breakfast")
//             {
//                 const doc1 = await Breakfast.findOneAndRemove({title: ctx.params.id});
//                 await Comment.deleteMany({postId: doc1._id})
//             }

           
//             return RecipeFunctions.displayPostAndComments(ctx, loggedUser, page);
//         });
//     }
//     else return
// });

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
    /*return Recipe.find({title: ctx.request.body.searchTerm}).then(async function(results){*/
    //GeneralFunctions.returnPostsAllDatabases(ctx);
    
    if(ctx.request.body.searchAlgorithm == "title")
    {
        return Breakfast.find({}).then(async function(results1) {
            return Lunch.find({}).then(async function(results2) {
                return Supper.find({}).then(async function(results3) {
                    
                    var results;
                    
                    var isTitleInEntry = false;
                    for(var i = 0; i < results1.length; i++)
                    {
                        //console.log(results1[i]);
                        //console.log(results1[i].title + " vs. " + ctx.request.body.searchTerms)

                        if(results1[i].title == ctx.request.body.searchTerms)
                        {
                            console.log("Hit" + results1);
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

                        if(results2[i].title == ctx.request.body.searchTerms)
                        {
                            console.log("Hit" + results1);
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

                        if(results3[i].title == ctx.request.body.searchTerms)
                        {
                            console.log("Hit" + results1);
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
                    results = results1 + results2 + results3;
                    console.log(results);
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
        return Breakfast.find({ingredients: ctx.request.body.searchTerms}).then(async function(results1) {
            return Lunch.find({ingredients: ctx.request.body.searchTerms}).then(async function(results2) {
                return Supper.find({ingredients: ctx.request.body.searchTerms}).then(async function(results3) {
                    
                    var results = results1 + results2 + results3;
                    console.log(results);

                    var searchTerms = ctx.request.body.searchTerms.split(/\s*,\s*/);
                    for(var i = 0; i < results1.length; i++)
                    {
                        for(var j = 0; j < searchTerms; j++)
                        {

                        }
                    }
                    for(var i = 0; i < results2.length; i++)
                    {

                    }
                    for(var i = 0; i < results3.length; i++)
                    {

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
    */
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