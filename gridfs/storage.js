require('dotenv').config();
const multer = require('@koa/multer');
const {GridFsStorage} = require('multer-gridfs-storage');

const host = process.env.host;

const storage = new GridFsStorage({
    url: host
});
const upload = multer({storage});

module.exports = upload;