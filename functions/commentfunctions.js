const Koa = require('koa');
const Recipe = require('../model/recipe.js');
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
    return Recipe.findById(ctx.params.id).then(async function(results) {
        var commentsOnPosts = await Comment.find({postId: ctx.params.id});
            await ctx.render('recipe', {
                post: results,
                comments: commentsOnPosts
        });
    })
}

module.exports.createComment = createComment;
module.exports.displayComments = displayComments;


