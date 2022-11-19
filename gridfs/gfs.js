require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');
const multer = require('@koa/multer');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');

const host = process.env.host;
const conn = mongoose.createConnection(host);

let gfs;

// conn.once('open', () => {
//     gfs = new mongoose.mongo.GridFSBucket(conn.db, {
//         bucketName: 'files'
//     });
//     return gfs;
// });

conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('images')
});

module.exports = gfs;