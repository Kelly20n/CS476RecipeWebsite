require('dotenv').config();
const Koa = require('koa');
const alert = require('alert');
const jwt = require('jsonwebtoken');

function createToken(ctx) {
    const secret = process.env.TOKEN_SECRET;
    const jwtToken = jwt.sign(ctx.request.body, secret, {expiresIn: 60 * 60})
    ctx.cookies.set('token', jwtToken)
    return;
}

function verifyUser(ctx) {
    var bool = true;
    jwt.verify(ctx.cookies.get('token'), process.env.TOKEN_SECRET, async (err, info) => {
        if(err){
            console.log('Not valid token!')
            bool = false;
            alert('Please sign in to complete this action');
            return await ctx.redirect('/login')
        } else {
            console.log(info);
        }
    });
    console.log(bool);
    return bool;
}

function decodeUser(ctx) {
    if(ctx.cookies.get("token") != null) {
        const decoded = jwt.decode(ctx.cookies.get("token"), {complete: true});
        const payload = decoded.payload;
        return payload;
    }
    else return false
}

async function displayNoDBinfo(ctx, loggedUser, page) {
    await ctx.render(page, {
        admin: loggedUser
    })
}

async function sleep() {
    return await new Promise(r => setTimeout(r, 1000));
}

module.exports.createToken = createToken;
module.exports.verifyUser = verifyUser;
module.exports.decodeUser = decodeUser;
module.exports.displayNoDBinfo = displayNoDBinfo
module.exports.sleep = sleep;