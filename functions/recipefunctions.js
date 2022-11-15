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

async function displayPostAndComments(ctx, adminUser, page) {
    return Recipe.findById(ctx.params.id).then(async function(results) {
        var commentsOnPosts = await Comment.find({postId: ctx.params.id});
            await ctx.render(page, {
                post: results,
                comments: commentsOnPosts,
                admin: adminUser
        });
    })
}

async function displayPostTitles(ctx, adminUser, page) {
    return Recipe.find({}).then(async function(results) {
        await ctx.render(page, {
            posts: results,
            admin: adminUser
        });
    });
}



module.exports.createComment = createComment;
module.exports.displayPostAndComments = displayPostAndComments;
module.exports.displayPostTitles = displayPostTitles;


