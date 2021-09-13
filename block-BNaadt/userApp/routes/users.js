var express = require('express');
var router = express.Router();

const User = require('../models/user');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// register users
router.get('/register', (req, res) => {
  let error = req.flash('error')[0];
  res.render('registerForm', { error });
});

router.post('/register', (req, res, next) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) return next(err);

    // user exists
    if (user) {
      req.flash('error', 'Email already exists.');
      return res.redirect('/users/register');
    }

    // password is less than 4 chars
    if (req.body.password.length < 4) {
      req.flash('error', 'Password is less than 4 characters');
      return res.redirect('/users/register');
    }

    // user does not exist
    User.create(req.body, (err, user) => {
      if (err) return next(err);
      res.redirect('/users/login');
    });
  });
});

// login router
router.get('/login', (req, res) => {
  let error = req.flash('error')[0];
  res.render('loginForm', { error });
});

router.post('/login', (req, res, next) => {
  let { email, password } = req.body;

  if (!email || !password) {
    req.flash('error', 'Email or password is not entered.');
    return res.redirect('/users/login');
  }

  // email validation
  User.findOne({ email }, (err, user) => {
    if (err) return next(err);

    if (!user) {
      req.flash('error', 'User is not registered.');
      return res.redirect('/users/login');
    }

    // email is valid, password check
    user.verifyPassword(password, (err, result) => {
      if (err) return next(err);

      if (!result) {
        req.flash('error', 'Password is incorrect.');
        return res.redirect('/users/login');
      }

      // password is valid, creating session
      req.session.userId = user.id;

      res.render('dashboard');
    });
  });
});

// logout router
router.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.clearCookie('connect-sid');
  res.redirect('/users/login');
});

module.exports = router;