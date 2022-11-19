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
        const payload = GeneralFunctions.decodeUser(ctx);
        const page = 'admin';
        return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
            if(loggedUser == null) {
                ctx.cookies.set('token', null);
                return await ctx.redirect("/");
            }
            else if(loggedUser.isAdmin == true) {
                return UserFunctions.displayUsers(ctx, loggedUser, page);
            }
            else {
                ctx.cookies.set('token', null);
                return await ctx.redirect("/");
            }
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
        return Banned.findOne({username: ctx.request.body.userEmail}).then(async function(check) {
            console.log(check);
            if(check != null)
            {
                await ctx.redirect('/signup');
            }

            if (ctx.request.body.userPass == ctx.request.body.userPassConfirm && err == null)
            {
                console.log('Successful Sign Up');
                
                var newUser = new User({
                    name: ctx.request.body.name,
                    username: ctx.request.body.userEmail,
                    password: ctx.request.body.userPass,
                    isAdmin: false,
                    securityQ: ctx.request.body.securityQ,
                    securityA: ctx.request.body.securityA
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
});

route.get('/signout', async (ctx, next) => {
    ctx.cookies.set('token', null);
    await ctx.redirect('/');
});

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

route.get('/forgotpasswordportal', async (ctx, next) => {
    const payload = GeneralFunctions.decodeUser(ctx);
    const page = 'forgotpasswordportal'
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
        await ctx.redirect('/admin');
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
        await ctx.redirect('/admin');
    }
    else return
})

route.post('/ban/:id', async (ctx, next) => {
    if(GeneralFunctions.verifyUser(ctx) === true)
    {
        const doc = await User.findByIdAndRemove(ctx.params.id);
        var newBanned = new Banned({
            username: doc.username,
            password: doc.password,
            isAdmin: doc.isAdmin,
            name: doc.name
        });
        newBanned.save();
        await ctx.redirect('/admin');
    }
    else return
})

route.post('/unban/:id', async (ctx, next) => {
    if(GeneralFunctions.verifyUser(ctx) === true)
    {
        const doc = await Banned.findByIdAndRemove(ctx.params.id);
        var newUser = new User({
            username: doc.username,
            password: doc.password,
            isAdmin: doc.isAdmin,
            name: doc.name
        });
        newUser.save();
        await ctx.redirect('/admin');
    }
});

route.post('/forgotpasswordportal', async(ctx, next) => { 
    return User.findOne({username: ctx.request.body.userEmail}).then(async function(results) {
        console.log(results);
        if(results == null) {
            ctx.redirect('/forgotpasswordportal');
        }
        else {
            return await ctx.render('forgotpassword', {
                user: results
            });
    }
    });
});

route.post('/resetpassword/:id', async(ctx, next) => {
    return User.findById(ctx.params.id).then(async function(results) {
        if(results.securityA == ctx.request.body.securityA) {
            return await ctx.render('resetpassword', {
                user: results
            });
        }
        else {
            return await ctx.render('forgotpassword', {
                user: results
            });
        }
    })
    
});

route.post('/passwordisreset/:id', async(ctx, next) => {
    await User.findByIdAndUpdate(ctx.params.id, { password: ctx.request.body.userPass})
    ctx.redirect('/login');
})

route.get('/khanhiscute', async(ctx, next) => {
    ctx.status = 418;
})

module.exports = route;