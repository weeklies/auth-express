var express = require('express');
var router = express.Router();

const messageController = require('../controllers/messageController');
const Message = require('../models/message');

/* GET messages listing. */
router.get('/', async function (req, res, next) {
  try {
    const messages = await Message.find().exec();
    res.render('messages', { messages });
  } catch (err) {
    return next(err);
  }
});

router.get('/new', function (req, res, next) {
  // TODO
  res.render('new-message');
});

router.post('/new', function (req, res, next) {
  // TODO
  res.redirect('/messages');
});

module.exports = router;
