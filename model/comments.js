const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    postId: String,
    user: String,
    commentBody: String,
    postDB: String,
});

const Comment = mongoose.model('comments', commentSchema);

module.exports = Comment;