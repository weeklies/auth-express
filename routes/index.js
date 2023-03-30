var express = require('express');
var router = express.Router();

const passport = require('passport');

const userController = require('../controllers/userController');
const User = require('../models/user');

router.get('/', function (req, res, next) {
  if (req.user) return res.redirect('/messages');

  res.redirect('/login');
});

router.get('/login', function (req, res, next) {
  if (req.user) return res.redirect('/messages');

  const flash = req.flash();
  if (flash.error) {
    const err = new Error(flash.error[0]);
    err.status = 401;
    return next(err);
  }

  res.render('login', {
    user: req.user,
    success: req.session.success,
  });
});

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/',
    failureFlash: true,
  })
);
router.get('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect('/');
  });
});

router.get('/signup', (req, res) => {
  if (req.user) return res.redirect('/');
  return res.render('signup');
});

router.post(
  '/signup',
  ...userController.validateSignUp,
  userController.postSignUp
);

router.get('/status', (req, res, next) => {
  if (req.user) {
    return res.render('status');
  } else {
    res.redirect('/login');
  }
});

router.get('/member', (req, res) => {
  if (!req.user) return res.redirect('/login');

  return res.render('member');
});

router.post(
  '/member',
  ...userController.validateMembership,
  userController.postMembership
);

router.get('/admin', async (req, res, next) => {
  if (!req.user || !req.user.admin) {
    const err = new Error('Unauthorized');
    err.status = 403;
    return next(err);
  }

  try {
    const users = await User.find().exec();
    res.render('admin', { users: users });
  } catch (err) {
    return next(err);
  }
});
module.exports = router;
