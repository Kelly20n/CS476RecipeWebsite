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
//Create Our Server Object
//////////////////////////
const logger = require('koa-logger')
const koa = require('koa');
const server = new koa();

//////////////////////////
//Bring in controllers
//////////////////////////
const recipeController = require('./controller/recipecontroller');
const userController = require('./controller/usercontroller');

//////////////////////////
//Create Our Static Folder
//npm i koa-static
//////////////////////////
const static = require('koa-static');

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
const koaNunjucks = require('koa-nunjucks-2');
const path = require('path');
const { append } = require('koa/lib/response.js');
const { getCipherInfo } = require('crypto');

//////////////////////////
//Middleware
//////////////////////////
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
server.use(recipeController.routes());
server.use(recipeController.allowedMethods());
server.use(userController.routes());
server.use(userController.allowedMethods());
server.use(static('./public'));


//////////////////////////
//Our Listener on Port 1985
//////////////////////////
server.listen(1985);