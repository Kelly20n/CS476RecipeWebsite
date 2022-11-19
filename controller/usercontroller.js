require('dotenv').config();

//global variables
const User = require('../model/user');
const Banned = require('../model/banned');
const Router = require('koa-router');
const GeneralFunctions = require('../functions/generalfunctions.js')
const UserFunctions = require('../functions/userfunctions.js')
const route = Router();

//route get for admin to check if user is logged into an account with admin priveleges and displays ti
route.get('/admin', async (ctx, next) => {
    if(GeneralFunctions.verifyUser(ctx) === true)
    {
        const payload = GeneralFunctions.decodeUser(ctx);
        const page = 'admin';
        return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
            //check if user logged in
            if(loggedUser == null) {
                ctx.cookies.set('token', null);
                return await ctx.redirect("/");
            }
            //check if user is admin
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
        
//route post for login input
route.post('/login', async (ctx, next) => {
    return User.findOne({username: ctx.request.body.userEmail}).then(async function(results) {
        //check if input is empty
        if(results === null)
        {
            console.log('Unsuccessful Login2');
            return await ctx.render('incorrectlogin');
        }
        //checks if input matches existing account info
        if(ctx.request.body.userEmail === results.username && ctx.request.body.userPass === results.password)
        {
            GeneralFunctions.createToken(ctx);
            await ctx.redirect("/");
        }
        //otherwise input is wrong
        else
        {
            console.log('Unsuccessful Login3');
            return await ctx.render('incorrectlogin');
        }
    });
});

//route post for signup
route.post('/signup', async (ctx, next) => {
    //search through users and banned users database
    return User.findOne({username: ctx.request.body.userEmail}).then(async function(err, results) {
        return Banned.findOne({username: ctx.request.body.userEmail}).then(async function(check) {
            console.log(check);
            //if signup not allowed/working redirect to signup
            if(check != null)
            {
                await ctx.redirect('/signup');
            }
            //if signup matches condition means it was sucessfull
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

//route get for sign out to sign a user out
route.get('/signout', async (ctx, next) => {
    ctx.cookies.set('token', null);
    await ctx.redirect('/');
});

//route get for login getting login page
route.get('/login', async (ctx, next) => {
    const payload = GeneralFunctions.decodeUser(ctx);
    const page = 'login'
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
        return GeneralFunctions.displayNoDBinfo(ctx, loggedUser, page);
    })
});

//route get for getting signup page
route.get('/signup', async (ctx, next) => {
    const payload = GeneralFunctions.decodeUser(ctx);
    const page = 'signup'
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
        return GeneralFunctions.displayNoDBinfo(ctx, loggedUser, page);
    })
});

//route get for getting forgetpassword page
route.get('/forgotpasswordportal', async (ctx, next) => {
    const payload = GeneralFunctions.decodeUser(ctx);
    const page = 'forgotpasswordportal'
    return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
        return GeneralFunctions.displayNoDBinfo(ctx, loggedUser, page);
    })
});

//route post for if admin decides to give a user admin priveleges
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

//route post for if admin decides to remove admin priveleges from a user
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

//route post for if admin decides to ban a user
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

//route post for if admin decides to unban a user
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