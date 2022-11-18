require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');
const multer = require('@koa/multer');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');

const host = process.env.host;
const conn = mongoose.createConnection(host);



conn.once('open', () => {
    var gfs = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'images'
    });
});

const storage = new GridFsStorage({
    url: host,
    // file: (req, file) => {
    //     return new Promise((resolve, reject) => {
    //         crypto.randomBytes(16, (err, buf) => {
    //             if(err) {
    //                 return reject(err);
    //             }
    //             const filename = buf.toString('hex') + path.extname(file.originalname);
    //             const fileInfo = {
    //                 filename: filename,
    //                 bucketName: 'images'
    //             };
    //             resolve(fileInfo);
    //         });
    //     });
    // }
});
const upload = multer({storage});

module.exports = upload;