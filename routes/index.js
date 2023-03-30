var express = require("express");
var router = express.Router();

const bcrypt = require("bcryptjs");
const passport = require("passport");
const { body, validationResult } = require("express-validator");

// TODO migrate logic to controller.
const user_controller = require("../controllers/userController");
const message_controller = require("../controllers/messageController");

const User = require("../models/user");
const Message = require("../models/message");

/* GET home page. */
router.get(["/", "/log-in"], function (req, res, next) {
  res.render("index", {
    title: "Members Only",
    user: req.user,
    success: req.session.success,
  });
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
    failureRedirect: "/",
  })
);

router.get("/sign-up", (req, res) => {
  if (req.user) return res.redirect("/");
  return res.render("sign-up-form");
});

router.post(
  "/sign-up",
  body("fullname")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Full name is required."),
  body("username")
    .trim()
    .isLength({ min: 1 })
    .withMessage("User name is required."),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password has to be at least 8 characters long.")
    .custom((value, { req }) => !value.includes(" "))
    .withMessage("Password must not contain spaces."),
  body("password-confirm")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Password confirmation must match provided password."),
  body("disclaimer", "You must agree to the privacy disclaimer.").equals("on"),
  validationHandler,
  async (req, res, next) => {
    // Check if user already exists.
    const user = await User.findOne({ username: req.body.username });
    if (user) {
      err = new Error("Account already exists.");
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

      req.session.success = { msg: "Your account was created successfully." };
      res.redirect("/");
    });
  }
);

router.get("/membership", (req, res) => {
  if (!req.user) return res.redirect("/log-in");

  return res.render("membership");
});

function validationHandler(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400);

    // There are errors. Render form again with sanitized values/errors messages.
    res.render("sign-up-form", {
      fullname: req.body.fullname,
      username: req.body.username,
      errors: errors.array(),
    });
    return;
  }

  next();
}

module.exports = router;
