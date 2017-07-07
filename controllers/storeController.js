const mongoose = require("mongoose");

// Grabs Store from mongoose (Singleton pattern)
const Store = mongoose.model("Store");

exports.homePage = (req, res) => {
  res.render("index");
};

exports.addStore = (req, res) => {
  // Editing and saving - use same template (DRY)
  res.render("editStore", { title: "Add Store" });
};

exports.createStore = async (req, res) => {
  // Only picks data from POST request defined in the schema
  const store = new Store(req.body);
  await store.save();
  res.redirect("/");
};
