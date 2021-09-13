var express = require('express');
var router = express.Router();
const User = require('../models/user');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// register router
router.get('/register', (req, res, next) => {
  let error = req.flash('error')[0];
  res.render('registerForm', { error });
});

router.post('/register', (req, res, next) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) return next(err);

    if (user) {
      req.flash('error', 'Email is already registered.');
      return res.redirect('/users/register');
    }

    if (req.body.password.length < 5) {
      req.flash('error', 'Password must have atleast 5 characters.');
      return res.redirect('/users/register');
    }

    User.create(req.body, (err, user) => {
      if (err) return next(err);
      res.redirect('/users/login');
    });
  });
});

// login router
router.get('/login', (req, res, next) => {
  let error = req.flash('error')[0];
  res.render('loginForm', { error });
});

router.post('/login', (req, res, next) => {
  let { email, password } = req.body;

  if (!email || !password) {
    req.flash('error', 'Email and Password are required.');
    return res.redirect('/users/login');
  }

  User.findOne({ email }, (err, user) => {
    if (err) return next(err);

    if (!user) {
      req.flash('error', 'Email is not registered.');
      return res.redirect('/users/login');
    }

    user.verifyPassword(password, (err, result) => {
      if (err) return next(err);

      if (!result) {
        req.flash('error', 'Password is incorrect.');
        return res.redirect('/users/login');
      }

      req.session.userId = user.id;
      res.render('dashboard');
    });
  });
});

// logout router
router.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
