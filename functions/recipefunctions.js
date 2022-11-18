const Koa = require('koa');
const Recipe = require('../model/recipe.js');
const Breakfast = require('../model/breakfast.js');
const Lunch = require('../model/lunch.js');
const Supper = require('../model/supper.js');
const Comment = require('../model/comments.js');
const User = require('../model/user.js');


function createComment(ctx, databaseUsed) {
    console.log("Commment func" + databaseUsed);
    var newComment = new Comment({
        postId: ctx.params.id,
        commentBody: ctx.request.body.userComment,
        postDB: databaseUsed,
    });
    console.log(newComment);
    newComment.save();
    return;
}

async function displayPostAndComments(ctx, adminUser, page, databaseUsed) {
    console.log("databvase:" + databaseUsed);
    if(databaseUsed == "Breakfast")
    {
        return Breakfast.findById(ctx.params.id).then(async function(results) {
            var commentsOnPosts = await Comment.find({postId: ctx.params.id, postDB: databaseUsed});
                await ctx.render(page, {
                    post: results,
                    comments: commentsOnPosts,
                    admin: adminUser,
                    databaseUsed: databaseUsed
            });
        })
    }
    else if(databaseUsed == "Lunch")
    {
        return Lunch.findById(ctx.params.id).then(async function(results) {
            var commentsOnPosts = await Comment.find({postId: ctx.params.id, postDB: databaseUsed});
                await ctx.render(page, {
                    post: results,
                    comments: commentsOnPosts,
                    admin: adminUser,
                    databaseUsed: databaseUsed
            });
        })
    }
    else if (databaseUsed == "Supper")
    {
        return Supper.findById(ctx.params.id).then(async function(results) {
            var commentsOnPosts = await Comment.find({postId: ctx.params.id, postDB: databaseUsed});
                await ctx.render(page, {
                    post: results,
                    comments: commentsOnPosts,
                    admin: adminUser,
                    databaseUsed: databaseUsed
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
                    databaseUsed: databaseUsed
            });
        })
    }
}

async function displayPostTitles(ctx, adminUser, page) {
    return Recipe.find({}).then(async function(results) {
        await ctx.render(page, {
            posts: results,
            admin: adminUser,
            databaseUsed: "Recipe"
        });
    });
}



module.exports.createComment = createComment;
module.exports.displayPostAndComments = displayPostAndComments;
module.exports.displayPostTitles = displayPostTitles;