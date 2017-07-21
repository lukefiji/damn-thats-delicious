const mongoose = require("mongoose");
const User = mongoose.model("User");
const promisify = require("es6-promisify");

exports.loginForm = (req, res) => {
  res.render("login", { title: "Login" });
};

exports.registerForm = (req, res) => {
  res.render("register", { title: "Register" });
};

// Validate registration middleware
exports.validateRegister = (req, res, next) => {
  req.sanitizeBody("name"); // From express-validator
  req.checkBody("name", "You must supply a name!").notEmpty();
  req.checkBody("email", "That email is not valid!").isEmail();

  // Normalizes email, i.e. 'userone@gmail.com' or 'user.one+food@gmail.com'
  // - from validator.js
  req.sanitizeBody("email").normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });

  req.checkBody("password", "Password cannot be blank!").notEmpty();
  req.checkBody("password-confirm", "Confirmed pasword cannot be blank!");
  req
    .checkBody("password-confirm", "Oops! Your passwords do not match!")
    .equals(req.body.password);

  // Handle errors
  const errors = req.validationErrors();
  if (errors) {
    req.flash("error", errors.map(err => err.msg));

    // Redirect with same inputs and flashes
    res.render("register", {
      title: "Register",
      body: req.body,
      flashes: req.flash() // Because it's happening on the same request
    });
    return; // Stop function from running
  }
  next(); // There were no errors
};

exports.register = async (req, res, next) => {
  const user = new User({
    email: req.body.email,
    name: req.body.name
  });
  // If method you're trying to promisify lands on an object,
  // pass to inherent object. ~bind it to User.
  const register = promisify(User.register, User);
  await register(user, req.body.password);
  next(); // Pass to authController.login
};
