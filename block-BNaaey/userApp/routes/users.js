var express = require('express');
var router = express.Router();

const User = require('../models/user');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// register users
router.get('/register', (req, res) => {
  res.render('registerForm');
});

router.post('/register', (req, res, next) => {
  User.create(req.body, (err, user) => {
    if (err) return next(err);
    res.redirect('/users/login');
  });
});

// login router
router.get('/login', (req, res) => {
  res.render('loginForm');
});

router.post('/login', (req, res, next) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.redirect('/users/login');
  }

  // email validation
  User.findOne({ email }, (err, user) => {
    if (err) return next(err);

    if (!user) return res.redirect('/users/login');

    // email is valid, password check
    user.verifyPassword(password, (err, result) => {
      if (err) return next(err);

      if (!result) return res.redirect('/users/login');

      // password is valid, creating session
      req.session.userId = user.id;

      res.render('dashboard');
    });
  });
});

module.exports = router;
