const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');
const Article = require('../models/article');

// Form to edit comment
router.get('/:id/edit', (req, res, next) => {
  let commentId = req.params.id;
  Comment.findById(commentId, (err, comment) => {
    if (err) return next(err);
    res.render('updateComment', { comment });
  });
});

// to update comment
router.post('/:id', (req, res, next) => {
  let commentId = req.params.id;
  Comment.findByIdAndUpdate(commentId, req.body, (err, updatedComment) => {
    if (err) return next(err);
    console.log(updatedComment);
    res.redirect(`/articles/${updatedComment.articleId}`);
  });
});

// to delete comment
router.get('/:id/delete', (req, res, next) => {
  let commentId = req.params.id;
  Comment.findByIdAndDelete(commentId, (err, deletedComment) => {
    if (err) return next(err);
    // Article.findByIdAndUpdate(
    //   deletedComment.articleId,
    //   { $pull: { comments: deletedComment.id } },
    //   (err, article) => {
    //     if (err) return next(err);
    //     res.redirect(`/articles/${deletedComment.articleId}`);
    //   }
    // );
    Article.findOneAndUpdate(
      { slug: deletedComment.articleId },
      { $pull: { comments: deletedComment.id } },
      (err, article) => {
        if (err) return next(err);
        res.redirect(`/articles/${deletedComment.articleId}`);
      }
    );
  });
});

module.exports = router;
