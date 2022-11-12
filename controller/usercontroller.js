require('dotenv').config();
const Koa = require('koa');
const User = require('../model/user');
const Recipe = require('../model/recipe');
const Router = require('koa-router');

const route = Router();

route.post('/admin', async (ctx, next) => {
    return User.findOne({username: ctx.request.body.userEmail}).then(async function(results) {
        if(results === null)
        {
            console.log("Admin Sign In Failed");
            console.log('Connected to Index Route');
            await ctx.redirect('/');
        }
        else if(ctx.request.body.pw === results.password && results.isAdmin)
        {
            console.log("Admin Sign In Successful");
            console.log('Connected to Admin Route');
            var recipeResults = await Recipe.find({});
            console.log(recipeResults);
            await ctx.render('admin', {
                posts: recipeResults
            });
        }
        else
        {
            console.log("Admin Sign In Failed");
            console.log('Connected to Index Route');
            await ctx.redirect('/');
        }
    });
});

route.get('/login', async (ctx, next) => {
        await ctx.render('login');
    });

route.post('/login',async (ctx, next) => {
    return User.findOne({username: ctx.request.body.userEmail}).then(async function(results) {
        /////////////////////////
        //RESULTS HOLDS THE QUERY VARIABLES
        /////////////////////////
        console.log("results" + results + "\n")
        console.log("ctx userEmail: " + ctx.request.body.userEmail + " userPass: " + ctx.request.body.userPass + "\n")
        if(results === null)
        {
            console.log('Unsuccessful Login');
            await ctx.redirect("/login");
        }
        else if(ctx.request.body.userEmail === results.username && ctx.request.body.userPass === results.password)
        {
            console.log('Successful Login');
            
            await ctx.redirect("/");
        }
        else
        {
            console.log('Unsuccessful Login');
            await ctx.redirect("/login");
        }
    });
});

route.get('/signup', async (ctx, next) => {
    await ctx.render('signup');
});

route.post('/signup', async (ctx, next) => {
    /////////////////////////
    //RESULTS HOLDS THE QUERY VARIABLES
    /////////////////////////
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

            await ctx.redirect("/");
        }

        else
        {
            console.log('Unsuccessful Sign Up');
            await ctx.redirect("/signup");
        }
    });
});

route.get('/forgotpassword', async (ctx, next) => {
    await ctx.render('signup');
});


module.exports = route;