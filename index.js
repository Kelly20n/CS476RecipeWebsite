//////////////////////////
//Initializing Environment Variables
//npm i dotenv
//npm i koa-methodoverride
//npm i koa-bodyparser
//////////////////////////
require('dotenv').config();
const override = require('koa-methodoverride');
const parser = require('koa-bodyparser');

//////////////////////////
//Connecting the DB
//npm i mongoose
//////////////////////////
const mongoose = require('mongoose');
const db = mongoose.connection;
const host = process.env.host;
const dbupdate = {
    useNewUrlParser: true,
    useUnifiedTopology: true};
mongoose.connect(host, dbupdate);

mongoose.connection.on

db.on('error', (err) => console.log('Error, DB Not connected'));
db.on('connected', () => console.log ('connected to mongo'));
db.on('disconnected', () => console.log ('Mongo is disconnected'));
db.on('open', () => console.log ('Connection Made!'));

//////////////////////////
//Model Schema
//////////////////////////
const Recipe = require('./model/recipe.js');
const User = require('./model/user.js');

//////////////////////////
//Create Our Server Object
//////////////////////////
const logger = require('koa-logger')
const koa = require('koa');
const server = new koa();


//////////////////////////
//Create Our Static Folder
//npm i koa-static
//////////////////////////
const static = require('koa-static');

//////////////////////////
//Creating Our Router
//npm i koa-router
//////////////////////////
const Router = require('koa-router');
const route = Router();

//////////////////////////
//Setting up authentication
//npm i koa-passport
//npm i koa-session
//////////////////////////
const passport = require('koa-passport');
const session = require('koa-session');

//////////////////////////
//Initializing views
//npm i koa-views
//npm i nunjucks
//////////////////////////
// const views = require('koa-views');
// const nunj = require('nunjucks');
// nunj.configure('./views', {autoescape: true});
const koaNunjucks = require('koa-nunjucks-2');
const path = require('path');
const { append } = require('koa/lib/response.js');
const { getCipherInfo } = require('crypto');

//////////////////////////
//Routes
//Route.get - route.post - route.patch - post.put - route.delete
//////////////////////////
// route.get('/', (ctx, next) => {
//     console.log('connected to root route');
//     return Recipe.find({}, async (error, results) => {
//         console.log(results);
//         await ctx.render('index', {
//             posts: results,
//             name: process.env.NAME
//         });
        
//     }).clone()
// });

route.get('/', async (ctx, next) => {
    // console.log('connected to root route');
    return Recipe.find({}).then(async function(results) {
        console.log(results);
        await ctx.render('index', {
            posts: results,
            name: process.env.NAME
        });
    });
});


route.get('/view/:id', async (ctx, next) => {
    console.log('connected to recipe route');
    return Recipe.findById(ctx.params.id).then(async function(results) {
        console.log(results)
        await ctx.render('recipe', {
            post: results
        });
    });
});

// Add functionality to make admin login
route.post('/admin', async (ctx, next) => {
    return User.findOne({username: ctx.request.body.userEmail}).then(async function(results) {
        if(ctx.request.body.pw === results.password && results.isAdmin)
        {
            console.log("Admin Sign In Successful");
            console.log('Connected to Admin Route');
            await ctx.render('admin', {
                posts: results
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


// Add login functionality (check database for matches)
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
        if(ctx.request.body.userEmail === results.username && ctx.request.body.userPass === results.password)
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





// route.get('/', (ctx, next) => {
//     return ctx.render('index.html', {
//         name: process.env.NAME
//     })
// });

// route.get('/:name', (ctx, next) => {
//     return ctx.render('./index.html', {
//         name: ctx.params.name
//     })
// });

//////////////////////////
//Middleware
//////////////////////////
// server.use(views('./views', {map: {html: 'nunjucks'}}));
server.use(logger());
server.use(override('_method'));
server.use(parser());
server.use(koaNunjucks({
    ext: 'njk',
    path: path.join(__dirname, 'views'),
    nunjucksConfig: {
        trimBlocks: true
    }
}));
server.use(route.routes());
server.use(static('./public'));





//////////////////////////
//Our Listener on Port 1985
//////////////////////////
server.listen(1985);