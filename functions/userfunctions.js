const Koa = require('koa');
const Recipe = require('../model/recipe.js');
const Comment = require('../model/comments.js');
const User = require('../model/user.js');
const jwt = require('jsonwebtoken');

async function displayUsers(ctx, loggedUser, page) {
    return User.find({}).then(async function(results) {
        await ctx.render(page, {
            users: results,
            admin: loggedUser
        });
    });
}

module.exports.displayUsers = displayUsers;
