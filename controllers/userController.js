const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

const User = require('../models/user');

exports.validateSignUp = [
  body('fullname')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Full name is required.'),
  body('username')
    .trim()
    .isLength({ min: 1 })
    .withMessage('User name is required.'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password has to be at least 8 characters long.')
    .custom((value, { req }) => !value.includes(' '))
    .withMessage('Password must not contain spaces.'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Password confirmation must match provided password.'),
  body('disclaimer', 'You must agree to the privacy disclaimer.').equals('on'),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400);

      // There are errors. Render form again with sanitized values/errors messages.
      res.render('signup', {
        fullname: req.body.fullname,
        username: req.body.username,
        errors: errors.array(),
      });
      return;
    }

    next();
  },
];

exports.postSignUp = async (req, res, next) => {
  // Check if user already exists.
  const user = await User.findOne({ username: req.body.username });
  if (user) {
    err = new Error('Account already exists.');
    err.status = 400;
    return next(err);
  }

  bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
    if (err) return next(err);

    const user = new User({
      fullname: req.body.fullname,
      username: req.body.username,
      password: hashedPassword,
      member: false, // Users can only become members after entering a secret code.
    });
    await user.save();

    req.session.success = { msg: 'Your account was created successfully.' };
    res.redirect('/');
  });
};

exports.validateMembership = [
  body('secretCode')
    .trim()
    .equals('potatosalad')
    .withMessage('Secret code is incorrect.'),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400);

      // There are errors. Render form again with sanitized values/errors messages.
      res.render('member', {
        errors: errors.array(),
      });
      return;
    }
    next();
  },
];

exports.postMembership = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { member: true }).exec();
    res.redirect('/messages/new');
  } catch (err) {
    next(err);
  }
};
