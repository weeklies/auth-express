const { body, validationResult } = require('express-validator');
const Message = require('../models/message');

exports.getMessage = (req, res, next) => {
  res.render('new-message');
};

exports.postMessage = [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required.'),
  body('text')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Body text is required.'),
  async (req, res, next) => {
    if (req.user.admin) return res.redirect('/messages');

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

exports.deleteMessage = async (req, res, next) => {
  if (!req.user.admin) {
    const err = new Error('Unauthorized');
    err.status = 403;
    return next(err);
  }

  try {
    await Message.findByIdAndDelete(req.params.id).exec();
    res.redirect('/messages');
  } catch (err) {
    return next(err);
  }
};
