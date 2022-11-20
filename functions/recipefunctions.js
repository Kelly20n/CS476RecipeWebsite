const Recipe = require('../model/recipe.js');
const Breakfast = require('../model/breakfast.js');
const Lunch = require('../model/lunch.js');
const Supper = require('../model/supper.js');
const Comment = require('../model/comments.js');
const toBeApproved = require('../model/approval.js');

//Function to create comment
function createComment(ctx, username) {
    //console.log("Commment func" + databaseUsed);
    var newComment = new Comment({
        postId: ctx.params.id,
        user: username,
        commentBody: ctx.request.body.userComment,
        postDB: ctx.params.db,
    });
    console.log(newComment);
    newComment.save();
    return;
}

function createToBeApproved(ctx, username) {
    var newToBeApproved = new toBeApproved({
        title: ctx.request.body.recipeTitle,
        ingredients: ctx.request.body.recipeIngredients,
        instructions: ctx.request.body.recipeInstructions,
        type: ctx.request.body.database,
        checked: 1,
        image: ctx.file.filename,
        date: new Date(),
        user: username.name
    });
    newToBeApproved.save((err, res) => {
        if(err) return handleError(err);
        else return
    });
}

function createBreakfast(ctx, username) {
    var newBreakfast = new Breakfast({
        title: ctx.request.body.recipeTitle,
        ingredients: ctx.request.body.recipeIngredients,
        instructions: ctx.request.body.recipeInstructions,
        type: ctx.request.body.database,
        checked: 0,
        image: ctx.file.filename,
        date: new Date(),
        user: username.name
    });
    newBreakfast.save((err, res) => {
        if(err) return handleError(err);
        else return
    });
}

function createLunch(ctx, username) {
    var newLunch = new Lunch({
        title: ctx.request.body.recipeTitle,
        ingredients: ctx.request.body.recipeIngredients,
        instructions: ctx.request.body.recipeInstructions,
        type: ctx.request.body.database,
        checked: 0,
        image: ctx.file.filename,
        date: new Date(),
        user: username.name
    });
    newLunch.save((err, res) => {
        if(err) return handleError(err);
        else return
    });
}

function createSupper(ctx, username) {
    var newSupper = new Supper({
        title: ctx.request.body.recipeTitle,
        ingredients: ctx.request.body.recipeIngredients,
        instructions: ctx.request.body.recipeInstructions,
        type: ctx.request.body.database,
        checked: 0,
        image: ctx.file.filename,
        date: new Date(),
        user: username.name
    });
    newSupper.save((err, res) => {
        if(err) return handleError(err);
        else return
    });
}

async function createRecipe(ctx, loggedUser) {
    if(ctx.request.body.database == "breakfast")
        {
            createBreakfast(ctx, loggedUser);
            createToBeApproved(ctx, loggedUser);
            console.log('breakfast added');
            await ctx.redirect('/');
        }
        else if(ctx.request.body.database == "lunch")
        {
            createLunch(ctx, loggedUser);
            createToBeApproved(ctx, loggedUser);
            console.log('lunch added');
            await ctx.redirect('/');
        }
        else
        {
            createSupper(ctx, loggedUser);
            createToBeApproved(ctx, loggedUser);
            console.log('supper added');
            await ctx.redirect('/');
        }
}

//display post and comments uses the db tag to find which database its from and then sends the info to the page
async function displayPostAndComments(ctx, adminUser, page) {
    if(ctx.params.check == 1)
    {
        //if check = 1 that means the post is in toBeApproved
        return toBeApproved.findById(ctx.params.id).then(async function(results){
            await ctx.render(page, {
                post: results,
                admin: adminUser
            });
        });
    }
    else if(ctx.params.db == "breakfast")
    {
        return Breakfast.findById(ctx.params.id).then(async function(results) {
            var commentsOnPosts = await Comment.find({postId: ctx.params.id, postDB: ctx.params.db});
                await ctx.render(page, {
                    post: results,
                    comments: commentsOnPosts,
                    admin: adminUser,
                    databaseUsed: ctx.params.db,
            });
        })
    }
    else if(ctx.params.db == "lunch")
    {
        return Lunch.findById(ctx.params.id).then(async function(results) {
            var commentsOnPosts = await Comment.find({postId: ctx.params.id, postDB: ctx.params.db});
                await ctx.render(page, {
                    post: results,
                    comments: commentsOnPosts,
                    admin: adminUser,
                    databaseUsed: ctx.params.db
            });
        })
    }
    else
    {
        return Supper.findById(ctx.params.id).then(async function(results) {
            var commentsOnPosts = await Comment.find({postId: ctx.params.id, postDB: ctx.params.db});
                await ctx.render(page, {
                    post: results,
                    comments: commentsOnPosts,
                    admin: adminUser,
                    databaseUsed: ctx.params.db
            });
        })
    }
}

//function to display just the image and the title for breakfast posts in reverse order
async function displayBreakfastPostTitles(ctx, adminUser, page) {
    return Breakfast.find({}).sort({'date': -1}).then(async function(results) {
                await ctx.render(page, {
                    posts: results,
                    admin: adminUser,
                });
    });
}

//function to display just the image and the title for lunch posts in reverse order
async function displayLunchPostTitles(ctx, adminUser, page) {
    return Lunch.find({}).sort({'date': -1}).then(async function(results) {
        
                await ctx.render(page, {
                    posts: results,
                    admin: adminUser,
                });
    });
}

//function to display just the image and the title for supper posts in reverse order
async function displaySupperPostTitles(ctx, adminUser, page) {
    return Supper.find({}).sort({'date': -1}).then(async function(results) {
        
                await ctx.render(page, {
                    posts: results,
                    admin: adminUser,
                });
            });
}

//function to display index page, with 5 posts from all categories
async function displayPostTitles(ctx, adminUser, page) {
    return Breakfast.find({}).sort({'date': -1}).limit(5).then(async function(results1) {
        return Lunch.find({}).sort({'date': -1}).limit(5).then(async function(results2) {
            return Supper.find({}).sort({'date': -1}).limit(5).then(async function(results3) {
                await ctx.render(page, {
                    posts1: results1,
                    posts2: results2,
                    posts3: results3,
                    admin: adminUser,
                });
            });
        });
    });
}


module.exports.createComment = createComment;
module.exports.createToBeApproved = createToBeApproved;
module.exports.createBreakfast = createBreakfast;
module.exports.createLunch = createLunch;
module.exports.createSupper = createSupper;
module.exports.createRecipe = createRecipe;
module.exports.displayPostAndComments = displayPostAndComments;
module.exports.displayPostTitles = displayPostTitles;
module.exports.displayBreakfastPostTitles = displayBreakfastPostTitles;
module.exports.displayLunchPostTitles = displayLunchPostTitles;
module.exports.displaySupperPostTitles = displaySupperPostTitles;