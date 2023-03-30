var express = require("express");
var router = express.Router();

const passport = require("passport");

const userController = require("../controllers/userController");
const messageController = require("../controllers/messageController");

const User = require("../models/user");
const Message = require("../models/message");

/* GET home page. */
router.get(["/", "/log-in"], function (req, res, next) {
  if (req.user) return res.render("dashboard");

  const flash = req.flash();
  if (flash.error) {
    const err = new Error(flash.error[0]);
    err.status = 401;
    return next(err);
  }

  res.render("index", {
    user: req.user,
    success: req.session.success,
  });
});

router.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
    failureFlash: true,
  })
);
router.get("/log-out", (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect("/");
  });
});

router.get("/sign-up", (req, res) => {
  if (req.user) return res.redirect("/");
  return res.render("sign-up-form");
});

router.post(
  "/sign-up",
  ...userController.validateSignUp,
  userController.postSignUp
);

router.get("/membership", (req, res) => {
  if (!req.user) return res.redirect("/log-in");

  return res.render("membership");
});

router.post(
  "/membership",
  ...userController.validateMembership,
  userController.postMembership
);

router.get("/admin", async (req, res, next) => {
  if (!req.user || !req.user.admin) {
    const err = new Error("Unauthorized");
    err.status = 403;
    return next(err);
  }

  try {
    const users = await User.find().exec();
    res.render("admin", { users: users });
  } catch (err) {
    return next(err);
  }
});
module.exports = router;
