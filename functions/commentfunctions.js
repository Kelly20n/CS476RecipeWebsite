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

async function displayComments(ctx) {
    //console.log(ctx.request.body.databaseUsed);
    if(ctx.params.databaseUsed == "Breakfast")
    {
        return Breakfast.findById(ctx.params.id).then(async function(results) {
            var commentsOnPosts = await Comment.find({postId: ctx.params.id});
                await ctx.render('recipe', {
                    post: results,
                    comments: commentsOnPosts
            });
        })
    }
    else if(ctx.params.databaseUsed == "Lunch")
    {
        return Lunch.findById(ctx.params.id).then(async function(results) {
            var commentsOnPosts = await Comment.find({postId: ctx.params.id});
                await ctx.render('recipe', {
                    post: results,
                    comments: commentsOnPosts
            });
        })
    }
    else
    {
        return Supper.findById(ctx.params.id).then(async function(results) {
            var commentsOnPosts = await Comment.find({postId: ctx.params.id});
                await ctx.render('recipe', {
                    post: results,
                    comments: commentsOnPosts
            });
        })
    }
}

module.exports.createComment = createComment;
module.exports.displayComments = displayComments;


