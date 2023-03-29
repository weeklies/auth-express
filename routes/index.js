var express = require('express');
var router = express.Router();

const bcrypt = require("bcryptjs");
const passport = require("passport");

// TODO migrate logic to controller.
const user_controller = require("../controllers/userController");
const message_controller = require("../controllers/messageController");

const User = require("../models/user");
const Message = require("../models/message");

/* GET home page. */
router.get(['/', '/log-in'], function (req, res, next) {
  res.render("index", { title: "Members Only", user: req.user },);
});


router.get("/log-out", (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect("/");
  });
});

router.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/"
  })
);


router.get("/sign-up", (req, res) => {

  return res.render("sign-up-form");
});

router.post("/sign-up", async (req, res, next) => {
  // Check if user already exists.
  const user = await User.findOne({ username: req.body.username });
  if (user) {
    err = new Error('Account already exists.');
    return next(err);
  }

  // TODO Validate password length and password match.

  bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
    if (err) return next(err);

    const user = new User({
      username: req.body.username,
      password: hashedPassword,
    });
    await user.save();
    res.redirect("/");
  }
  );
});

router.get('/membership', (req, res) => {
  if (!req.user) return res.redirect('/log-in');

  return res.render("membership");
})

module.exports = router;
