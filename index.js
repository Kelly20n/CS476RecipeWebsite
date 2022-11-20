//setup environmental variables and body parser
require('dotenv').config();
const parser = require('koa-bodyparser');

//Setup Server
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

//Setup Koa and logger
const logger = require('koa-logger')
const koa = require('koa');
const server = new koa();

//import controllers
const recipeController = require('./controller/recipecontroller');
const userController = require('./controller/usercontroller');

//Setup static folder
const static = require('koa-static');

//setup templating
const koaNunjucks = require('koa-nunjucks-2');
const path = require('path');


//Middleware
server.use(logger());
server.use(parser());
server.use(koaNunjucks({
    ext: 'njk',
    path: path.join(__dirname, 'views'),
    nunjucksConfig: {
        trimBlocks: true
    }
}));
server.use(recipeController.routes());
server.use(userController.routes());
server.use(static('./public'));


//Listen
server.listen(1985);