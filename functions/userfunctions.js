const Koa = require('koa');
// const Recipe = require('../model/recipe.js');
// const Comment = require('../model/comments.js');
const User = require('../model/user.js');
const jwt = require('jsonwebtoken');

async function displayUsers(ctx, loggedUser, page) {
    return User.find({isAdmin: 'false'}).then(async function(results) {
        return User.find({isAdmin: 'true'}).then(async function(results1) {
            await ctx.render(page, {
                users: results,
                adminusers: results1,
                admin: loggedUser
            });
        });
    });
}

module.exports.displayUsers = displayUsers;