var express = require('express');
var router = express.Router();
const Product = require('../models/product');
const User = require('../models/user');

// get all products
router.get('/', (req, res, next) => {
  Product.find({}, (err, products) => {
    if (err) return next(err);
    let id = req.session.userId;
    User.findById(id, (err, user) => {
      if (err) return next(err);
      res.render('listProducts', { products, user });
    });
  });
});

// create a new product
router.get('/new', (req, res, next) => {
  if (!req.session.isAdmin) {
    req.flash('error', 'You are not authorized to view this page');
    return res.redirect('/users/dashboard');
  }

  return res.render('productForm');
});

router.post('/', (req, res, next) => {
  if (!req.session.isAdmin) {
    req.flash('error', 'You are not authorized to view this page');
    return res.redirect('/users/dashboard');
  }

  Product.create(req.body, (err, product) => {
    if (err) return next(err);
    res.redirect('/products');
  });
});

// get details of single product
router.get('/:id', (req, res, next) => {
  let id = req.params.id;
  Product.findById(id, (err, product) => {
    if (err) return next(err);
    let userId = req.session.userId;
    User.findById(userId, (err, user) => {
      if (err) return next(err);
      res.render('productDetail', { product, user });
    });
  });
});

// edit router
router.get('/:id/edit', (req, res, next) => {
  let id = req.params.id;
  if (!req.session.isAdmin) {
    req.flash('error', 'You are not authorized to view this page');
    return res.redirect('/users/dashboard');
  }
  Product.findById(id, (err, product) => {
    if (err) return next(err);
    let userId = req.session.userId;
    User.findById(userId, (err, user) => {
      if (err) return next(err);
      res.render('productEdit', { product, user });
    });
  });
});

router.post('/:id', (req, res, next) => {
  let id = req.params.id;
  Product.findByIdAndUpdate(id, req.body, (err, product) => {
    if (err) return next(err);
    res.redirect(`/products/${id}`);
  });
});

// like the product
router.get('/:id/like', (req, res, next) => {
  let id = req.params.id;
  Product.findByIdAndUpdate(id, { $inc: { likes: 1 } }, (err, product) => {
    if (err) return next(err);
    res.redirect(`/products/${id}`);
  });
});

// dislike the product
router.get('/:id/dislike', (req, res, next) => {
  let id = req.params.id;
  Product.findByIdAndUpdate(id, { $inc: { likes: -1 } }, (err, product) => {
    if (err) return next(err);
    res.redirect(`/products/${id}`);
  });
});

// add to cart
router.get('/:id/cart', (req, res, next) => {
  let productId = req.params.id;
  let userId = req.session.userId;

  User.findByIdAndUpdate(
    userId,
    { $push: { cart: productId } },
    (err, user) => {
      if (err) return next(err);
      Product.findByIdAndUpdate(
        productId,
        { $inc: { quantity: -1 } },
        (err, product) => {
          if (err) return next(err);
          res.redirect(`/products/${productId}`);
        }
      );
    }
  );
});

// delete product
router.get('/:id/delete', (req, res, next) => {
  let id = req.params.id;
  Product.findByIdAndDelete(id, (err, deletedProduct) => {
    if (err) return next(err);

    User.updateMany({ cart: id }, { $pull: { cart: id } }, (err, user) => {
      if (err) return next(err);
      res.redirect('/products');
    });
  });
});

module.exports = router;
