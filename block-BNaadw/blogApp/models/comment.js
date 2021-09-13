const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let commentSchema = new Schema(
  {
    content: { type: String, required: true },
    author: String,
    articleId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
