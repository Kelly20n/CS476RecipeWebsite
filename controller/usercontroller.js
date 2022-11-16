require('dotenv').config();
const Koa = require('koa');
const User = require('../model/user');
const Banned = require('../model/banned');
const Recipe = require('../model/recipe');
const Router = require('koa-router');
const toBeApproved = require('../model/approval');
const GeneralFunctions = require('../functions/generalfunctions.js')
const UserFunctions = require('../functions/userfunctions.js')
const jwt = require('jsonwebtoken');
const Application = require('koa');
const { db } = require('../model/user');
const { mquery, Query } = require('mongoose');
const Breakfast = require('../model/breakfast.js');
const Lunch = require('../model/lunch.js');
const Supper = require('../model/supper.js');


route.get('/admin', async (ctx, next) => {
    if(GeneralFunctions.verifyUser(ctx) === true)
    {
        payload = GeneralFunctions.decodeUser(ctx);
        const page = 'admin';
        return User.findOne({username: payload.userEmail}).then(async function(loggedUser) {
            if(loggedUser.isAdmin == true) {
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

//get and post for approval page
route.get('/approval', async (ctx, next) => {
     return jwt.verify(ctx.cookies.get('token'), process.env.TOKEN_SECRET, async (err, info) => {
        if(GeneralFunctions.verifyUser(ctx) === true){
            return Recipe.find({}).then(async function(results) {
                await ctx.render('approval', {
                    posts: results
                });
            });
            
        }
        else return;
        
    });
});

//post for approve
route.post('/approval', async (ctx, next) => {
    var mybreakfast = {_id: ''};
    if(ctx.request.body.ar == "Approval Recipe")
    {
        db.collection('breakfastposts').deleteOne()
    }
    else return
});

//post for delete
route.post('/approval2', async (ctx, next) => {
    var myquery = {};
    db.collection('recipeposts').deleteOne(myquery,function(err, obj){
        if(err) throw err;
        console.log("deleted");
    });
    await ctx.redirect('approval');
});

//post for delete and delete in db
route.post('/approval3', async (ctx, next) => {
    console.log('button3');
    await ctx.redirect('approval');
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
            username: doc.username
        });
        newBanned.save();
        await ctx.redirect('/admin');
    }
    else return
})

route.post('/unban/:id', async (ctx, next) => {
    if(GeneralFunctions.verifyUser(ctx) === true)
    {
        await Banned.findByIdAndRemove(ctx.params.id);
        await ctx.redirect('/admin');
    }
});

module.exports = route;