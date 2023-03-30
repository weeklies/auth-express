const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const Message = require('../models/message');

exports.getMessage = (req, res, next) => {
  res.render('new-message');
};

exports.postMessage = [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required.'),
  body('text')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Body text is required.'),
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400);

      // There are errors. Render form again with sanitized values/errors messages.
      res.render('new-message', {
        title: req.body.title,
        text: req.body.text,
        errors: errors.array(),
      });
      return;
    }

    try {
      await Message.create({
        title: req.body.title,
        text: req.body.text,
        creator: req.user,
      });
      res.redirect('/messages');
    } catch (err) {
      return next(err);
    }
  },
];
