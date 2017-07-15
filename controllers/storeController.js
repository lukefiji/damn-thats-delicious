const mongoose = require("mongoose");
const Store = mongoose.model("Store"); // Grabs Store from mongoose (Singleton pattern)
const multer = require("multer");
const jimp = require("jimp");
const uuid = require("uuid");

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    // MIME type tells you what type it is
    const isPhoto = file.mimetype.startsWith("image/");
    if (isPhoto) {
      next(null, true);
    } else {
      next({ message: "That filetype isn't allowed!" }, false);
    }
  }
};

exports.homePage = (req, res) => {
  res.render("index");
};

exports.addStore = (req, res) => {
  // Editing and saving - use same template (DRY)
  res.render("editStore", { title: "Add Store" });
};

// We are looking for a single field, 'photo', and stores in memory
exports.upload = multer(multerOptions).single("photo");

exports.resize = async (req, res, next) => {
  // Check if there is no new file to resize
  if (!req.file) {
    next(); // Skip to next middleware
    return;
  }

  // Get extension from mimetype
  const extension = req.file.mimetype.split("/")[1];
  req.body.photo = `${uuid.v4()}.${extension}`; // Save filename into locals

  // Resize photo - jimp is based on promises
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);

  // Once we have written the photo to our filesystem, keep going!
  next();
};

exports.createStore = async (req, res) => {
  // Only picks data from POST request defined in the schema
  const store = await new Store(req.body);
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
  // Set the location data to be a point
  req.body.location.type = "Point";

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

// Use next() to let it trickle down to 404 page
exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug });
  if (!store) return next();

  res.render("store", { store, title: store.name });
};

exports.getStoresByTag = async (req, res) => {
  // Static method on Store model
  const tags = await Store.getTagsList();
  const tag = req.params.tag;
  res.render("tag", { tags, tag, title: "Tags" });
};
