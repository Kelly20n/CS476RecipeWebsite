require('dotenv').config();
const Koa = require('koa');
const jwt = require('jsonwebtoken');

function verifyUser(ctx) {
    var bool = true;
    jwt.verify(ctx.cookies.get('token'), process.env.TOKEN_SECRET, async (err, info) => {
        if(err){
            console.log('Not valid token!')
            bool = false;
            return await ctx.redirect('/login')
        } else {
            console.log(info);
        }
    });
    console.log(bool);
    return bool;
}

async function sleep() {
    await new Promise(r => setTimeout(r, 1000));
    return;
}
module.exports.verifyUser = verifyUser;
module.exports.sleep = sleep;