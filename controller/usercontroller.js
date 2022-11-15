require('dotenv').config();
const Koa = require('koa');
const User = require('../model/user');
const Recipe = require('../model/recipe');
const Router = require('koa-router');
const jwt = require('jsonwebtoken');

const route = Router();

route.get('/admin', async (ctx, next) => {
    return jwt.verify(ctx.cookies.get('token'), process.env.TOKEN_SECRET, async (err, info) => {
        if(err){
            console.log('Not valid token!')
            return await ctx.redirect('/login')
        }
        else {
            // console.log(info)
        }
        return User.find({}).then(async function(results) {
            var recipeResults = await Recipe.find({});
            console.log(recipeResults);
            await ctx.render('admin', {
                users: results,
                posts: recipeResults
            });
        });
    });
});

route.post('/login', async (ctx, next) => {
        return User.findOne({username: ctx.request.body.userEmail}).then(async function(results) {
        /////////////////////////
        //RESULTS HOLDS THE QUERY VARIABLES
        /////////////////////////
        console.log("results" + results + "\n")
        console.log("ctx userEmail: " + ctx.request.body.userEmail + " userPass: " + ctx.request.body.userPass + "\n")
        if(results === null)
        {
            console.log('Unsuccessful Login');
            await ctx.redirect("login");
        }
        else if(ctx.request.body.userEmail === results.username && ctx.request.body.userPass === results.password)
        {
            const secret = process.env.TOKEN_SECRET
            const jwtToken = jwt.sign(ctx.request.body, secret, {expiresIn: 60 * 60})
            ctx.cookies.set('token', jwtToken)
            console.log(ctx.cookies.get('token'))

            console.log(jwtToken);


            jwt.verify(ctx.cookies.get('token'), process.env.TOKEN_SECRET, (err, results) => {
                if(err){
                    console.log('Not valid token!')
                    ctx.redirect('/')
                }
                else {
                    console.log(results)
                }
            });
            await ctx.redirect("/");
        }
        else
        {
            console.log('Unsuccessful Login');
            await ctx.redirect("login");
        }
    });
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

route.get('/signedin', async (ctx, next) => {
    await ctx.render('signedin');
})

route.get('/login', async (ctx, next) => {
    await ctx.render('login');
});

route.get('/signup', async (ctx, next) => {
    await ctx.render('signup');
});

route.get('/forgotpassword', async (ctx, next) => {
    await ctx.render('forgotpassword');
});

module.exports = route;