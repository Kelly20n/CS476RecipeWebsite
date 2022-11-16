const Koa = require('koa');
const Recipe = require('../model/recipe.js');
const Breakfast = require('../model/breakfast.js');
const Lunch = require('../model/lunch.js');
const Supper = require('../model/supper.js');
const Comment = require('../model/comments.js');
const User = require('../model/user.js');


function createComment(ctx) {
    var newComment = new Comment({
        postId: ctx.params.id,
        commentBody: ctx.request.body.userComment,
    });
    newComment.save();
    return;
}

async function displayPostAndComments(ctx, adminUser, page, databaseUsed) {
    if(databaseUsed == "Breakfast")
    {
        return Breakfast.findById(ctx.params.id).then(async function(results) {
            var commentsOnPosts = await Comment.find({postId: ctx.params.id});
                await ctx.render(page, {
                    post: results,
                    comments: commentsOnPosts,
                    admin: adminUser
            });
        })
    }
    else if(databaseUsed == "Lunch")
    {
        return Lunch.findById(ctx.params.id).then(async function(results) {
            var commentsOnPosts = await Comment.find({postId: ctx.params.id});
                await ctx.render(page, {
                    post: results,
                    comments: commentsOnPosts,
                    admin: adminUser
            });
        })
    }
    else if (databaseUsed == "Supper")
    {
        return Supper.findById(ctx.params.id).then(async function(results) {
            var commentsOnPosts = await Comment.find({postId: ctx.params.id});
                await ctx.render(page, {
                    post: results,
                    comments: commentsOnPosts,
                    admin: adminUser
            });
        })
    }
    else{
        return Recipe.findById(ctx.params.id).then(async function(results) {
            var commentsOnPosts = await Comment.find({postId: ctx.params.id});
                await ctx.render(page, {
                    post: results,
                    comments: commentsOnPosts,
                    admin: adminUser
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