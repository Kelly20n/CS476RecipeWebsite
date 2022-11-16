require('dotenv').config();
const Koa = require('koa');
const User = require('../model/user');
const Banned = require('../model/banned');
const Recipe = require('../model/recipe');
const Router = require('koa-router');
const GeneralFunctions = require('../functions/generalfunctions.js')
const UserFunctions = require('../functions/userfunctions.js')
const jwt = require('jsonwebtoken');

const route = Router();

route.get('/admin', async (ctx, next) => {
    if(GeneralFunctions.verifyUser(ctx) === true)
    {
        payload = GeneralFunctions.decodeUser(ctx);
        const page = 'admin';
        return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
            return UserFunctions.displayUsers(ctx, loggedUser, page);
        });
    }
    else return
});
        

route.post('/login', async (ctx, next) => {
    return User.findOne({username: ctx.request.body.userEmail}).then(async function(results) {
        if(results === null)
        {
        console.log('Unsuccessful Login2');
        return await ctx.render('incorrectlogin');
        }
        if(ctx.request.body.userEmail === results.username && ctx.request.body.userPass === results.password)
        {
            GeneralFunctions.createToken(ctx);
            await ctx.redirect("/");
        }
        else
        {
            console.log('Unsuccessful Login3');
            return await ctx.render('incorrectlogin');
        }
    });
});

route.post('/signup', async (ctx, next) => {
    return User.findOne({username: ctx.request.body.userEmail}).then(async function(err, results) {
        //console.log("ctx: " + ctx.request.body.userPass + "\n")
        console.log(err + "\n")
        console.log(ctx.request.body.userEmail)
        //Checks if password is equal
        //Checks if there isnt another account with same email
        //if all checks pass then successful signup
        // Add logic to update mongoose of account

        if (ctx.request.body.userPass == ctx.request.body.userPassConfirm && err == null)
        {
            console.log('Successful Sign Up');
            
            var newUser = new User({
                username: ctx.request.body.userEmail,
                password: ctx.request.body.userPass,
                isAdmin: false,
            });

            newUser.save((err, res) => {
                if(err) return handleError(err);
                else return console.log("Result: ", res)
            });

            await ctx.redirect("/login");
        }

        else
        {
            console.log('Unsuccessful Sign Up');
            await ctx.redirect("signup");
        }
    });
});

route.get('/signout', async (ctx, next) => {
    ctx.cookies.set('token', null);
    await ctx.redirect('/');
})

route.get('/login', async (ctx, next) => {
    const payload = GeneralFunctions.decodeUser(ctx);
    const page = 'login'
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
        return GeneralFunctions.displayNoDBinfo(ctx, loggedUser, page);
    })
});

route.get('/signup', async (ctx, next) => {
    const payload = GeneralFunctions.decodeUser(ctx);
    const page = 'signup'
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
        return GeneralFunctions.displayNoDBinfo(ctx, loggedUser, page);
    })
});

route.get('/forgotpassword', async (ctx, next) => {
    const payload = GeneralFunctions.decodeUser(ctx);
    const page = 'forgotpassword'
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
        return GeneralFunctions.displayNoDBinfo(ctx, loggedUser, page);
    })
});

route.post('/mod/:id', async (ctx, next) => {
    if(GeneralFunctions.verifyUser(ctx) === true)
    {
        const doc = await User.findById(ctx.params.id);
        doc.isAdmin = true;
        await doc.save();
        console.log(doc);
        ctx.redirect('/admin');
    }
    else return
})

route.post('/unmod/:id', async (ctx, next) => {
    if(GeneralFunctions.verifyUser(ctx) === true)
    {
        const doc = await User.findById(ctx.params.id);
        doc.isAdmin = false;
        await doc.save();
        console.log(doc);
        ctx.redirect('/admin');
    }
    else return
})

route.post('/ban/:id', async (ctx, next) => {
    if(GeneralFunctions.verifyUser(ctx) === true)
    {
        const doc = await User.findByIdAndRemove(ctx.params.id);
        var newBanned = new Banned({
            username: doc.username
        });
        newBanned.save();
        ctx.redirect('/admin');
    }
})

module.exports = route;