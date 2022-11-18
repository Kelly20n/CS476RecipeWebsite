//global variables
const Recipe = require('../model/recipe.js');
const Breakfast = require('../model/breakfast.js');
const Lunch = require('../model/lunch.js');
const Supper = require('../model/supper.js');
const Comment = require('../model/comments.js');
const toBeApproved = require('../model/approval.js');

//function to create comment
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

//function to display posts and comments according database
async function displayPostAndComments(ctx, adminUser, page, databaseUsed) {
    if(ctx.params.check == 1)
    {
        return toBeApproved.findById(ctx.params.id).then(async function(results){
            await ctx.render(page, {
                post: results,
                admin: adminUser
            });
        });
    }
    else if(databaseUsed == "breakfast")
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
    else if(databaseUsed == "lunch")
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
    else if (databaseUsed == "supper")
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