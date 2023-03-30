var express = require('express');
var router = express.Router();

const messageController = require('../controllers/messageController');
const Message = require('../models/message');

/* GET messages listing. */
router.get('/', async function (req, res, next) {
  try {
    const messages = await Message.find().populate('creator').exec();
    res.render('messages', { messages: messages.slice().reverse() });
  } catch (err) {
    return next(err);
  }
});

router.get('/new', messageController.getMessage);
router.post('/new', messageController.postMessage);

// Only support a POST request.
router.post('/:id/delete', messageController.deleteMessage);

module.exports = router;
