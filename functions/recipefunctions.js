const Koa = require('koa');
const Recipe = require('../model/recipe.js');
const Breakfast = require('../model/breakfast.js');
const Lunch = require('../model/lunch.js');
const Supper = require('../model/supper.js');
const Comment = require('../model/comments.js');
const User = require('../model/user.js');
const toBeApproved = require('../model/approval.js');


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

async function displayPostAndComments(ctx, adminUser, page) {
    if(ctx.params.check == 1)
    {
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
    else if (ctx.params.db == "supper")
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
    else{
        return Recipe.findById(ctx.params.id).then(async function(results) {
            var commentsOnPosts = await Comment.find({postId: ctx.params.id, postDB: "Recipe"});
                await ctx.render(page, {
                    post: results,
                    comments: commentsOnPosts,
                    admin: adminUser,
                    databaseUsed: "Recipe"
            });
        })
    }
}

async function displayBreakfastPostTitles(ctx, adminUser, page) {
    return Breakfast.find({}).then(async function(results) {
        
                await ctx.render(page, {
                    posts: results,
                    admin: adminUser,
                });
            });
}

async function displayLunchPostTitles(ctx, adminUser, page) {
    return Lunch.find({}).then(async function(results) {
        
                await ctx.render(page, {
                    posts: results,
                    admin: adminUser,
                });
            });
}

async function displaySupperPostTitles(ctx, adminUser, page) {
    return Supper.find({}).then(async function(results) {
        
                await ctx.render(page, {
                    posts: results,
                    admin: adminUser,
                });
            });
}

async function displayPostTitles(ctx, adminUser, page) {
    return Breakfast.find({}).then(async function(results1) {
        return Lunch.find({}).then(async function(results2) {
            return Supper.find({}).then(async function(results3) {
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
module.exports.displayPostAndComments = displayPostAndComments;
module.exports.displayPostTitles = displayPostTitles;
module.exports.displayBreakfastPostTitles = displayBreakfastPostTitles;
module.exports.displayLunchPostTitles = displayLunchPostTitles;
module.exports.displaySupperPostTitles = displaySupperPostTitles;