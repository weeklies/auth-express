var express = require("express");
var router = express.Router();

const messageController = require("../controllers/messageController");
const Message = require("../models/message");

/* GET messages listing. */
router.get("/", function (req, res, next) {
  res.render("messages");
});

router.get("/new", function (req, res, next) {
  res.render("messages");
});

router.post("/new", function (req, res, next) {
  res.render("messages");
});

module.exports = router;
