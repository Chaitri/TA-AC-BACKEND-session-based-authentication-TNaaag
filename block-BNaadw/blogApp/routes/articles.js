var express = require('express');
var router = express.Router();
const Article = require('../models/article');
const Comment = require('../models/comment');

/* GET articles listing. */
router.get('/', function (req, res, next) {
  if (!req.session.userId) {
    req.flash('error', 'Page not accesible without logging in.');
    return res.redirect('/users/login');
  }

  Article.find({}, (err, articles) => {
    if (err) return next(err);
    res.render('articles', { articles: articles });
  });
});

router.get('/new', (req, res) => {
  if (!req.session.userId) {
    req.flash('error', 'Page not accesible without logging in.');
    return res.redirect('/users/login');
  }
  res.render('articleForm');
});

router.get('/:slug', (req, res, next) => {
  if (!req.session.userId) {
    req.flash('error', 'Page not accesible without logging in.');
    return res.redirect('/users/login');
  }
  let slug = req.params.slug;
  Article.findOne({ slug })
    .populate('comments')
    .exec((err, article) => {
      if (err) return next(err);
      res.render('singleArticle', { article });
    });
});

router.post('/', (req, res, next) => {
  if (!req.session.userId) {
    req.flash('error', 'Page not accesible without logging in.');
    return res.redirect('/users/login');
  }

  Article.create(req.body, (err, insertedArticle) => {
    if (err) next(err);
    res.redirect('/articles');
  });
});

router.get('/:slug/edit', (req, res, next) => {
  if (!req.session.userId) {
    req.flash('error', 'Page not accesible without logging in.');
    return res.redirect('/users/login');
  }
  let slug = req.params.slug;
  Article.findOne({ slug }, (err, article) => {
    if (err) next(err);
    console.log(article);
    res.render('editArticle', { article });
  });
});

router.post('/:slug', (req, res, next) => {
  if (!req.session.userId) {
    req.flash('error', 'Page not accesible without logging in.');
    return res.redirect('/users/login');
  }

  let slug = req.params.slug;
  console.log(slug);

  Article.findOneAndUpdate({ slug }, req.body, (err, updatedArticle) => {
    if (err) next(err);
    console.log(updatedArticle);
    res.redirect(`/articles/${updatedArticle.slug}`);
  });
});

router.get('/:slug/delete', (req, res, next) => {
  if (!req.session.userId) {
    req.flash('error', 'Page not accesible without logging in.');
    return res.redirect('/users/login');
  }
  let slug = req.params.slug;
  Article.findOneAndDelete({ slug }, (err, deletedArticle) => {
    if (err) next(err);
    Comment.deleteMany({ articleId: deletedArticle.id }, (err, info) => {
      if (err) return next(err);
      res.redirect('/articles');
    });
  });
});

// Like/Dislike button controls - Book
router.get('/:id/like', (req, res, next) => {
  if (!req.session.userId) {
    req.flash('error', 'Page not accesible without logging in.');
    return res.redirect('/users/login');
  }

  let id = req.params.id;
  Article.findByIdAndUpdate(id, { $inc: { likes: 1 } }, (err, article) => {
    if (err) return next(err);
    res.redirect(`/articles/${article.slug}`);
  });
});

router.get('/:id/dislike', (req, res, next) => {
  if (!req.session.userId) {
    req.flash('error', 'Page not accesible without logging in.');
    return res.redirect('/users/login');
  }

  let id = req.params.id;
  Article.findByIdAndUpdate(id, { $inc: { likes: -1 } }, (err, article) => {
    if (err) return next(err);
    res.redirect(`/articles/${article.slug}`);
  });
});

// Create Comment
router.post('/:slug/comments', (req, res, next) => {
  if (!req.session.userId) {
    req.flash('error', 'Page not accesible without logging in.');
    return res.redirect('/users/login');
  }

  let articleSlug = req.params.slug;
  req.body.articleId = articleSlug;

  Comment.create(req.body, (err, comment) => {
    if (err) return next(err);
    console.log(comment);
    Article.findOneAndUpdate(
      { slug: articleSlug },
      { $push: { comments: comment.id } },
      (err, updatedArticle) => {
        if (err) return next(err);
        res.redirect(`/articles/${updatedArticle.slug}`);
      }
    );
  });
});

module.exports = router;
