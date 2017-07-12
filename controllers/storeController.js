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
  const store = await new Store(req.body).save();
  await store.save();
  req.flash(
    "success",
    `Successfully created ${store.name}. Care to leave a review?`
  );
  // Response comes from store variable
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  // Query db for all stores
  const stores = await Store.find();

  // Return stores in locals
  res.render("stores", { title: "Stores", stores });
};

exports.editStore = async (req, res) => {
  // Find store given ID
  const store = await Store.findOne({ _id: req.params.id });

  // TODO: Verify user is are owner of the store

  // Render edit form so user can edit
  res.render("editStore", { title: `Edit ${store.name}`, store });
};

exports.updateStore = async (req, res) => {
  // Find and update the store
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // Return new store instead of old one
    runValidators: true // Run model validators on schema
  }).exec();

  // Redirect them to the store and flash success
  req.flash(
    "success",
    `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store →</a>`
  );
  res.redirect(`/stores/${store._id}/edit`);
};
