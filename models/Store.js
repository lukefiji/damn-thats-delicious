const mongoose = require("mongoose");
const slug = require("slugs");

// Use ES6 promises in mongoose
mongoose.Promise = global.Promise;

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: "Please enter a store name!"
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String]
});

// Save name as slug on save
storeSchema.pre("save", function(next) {
  // Skip if name isn't changed
  if (!this.isModified("name")) {
    return next(); // Return to break out of function
  }
  this.slug = slug(this.name);
  next();

  // TODO: make more resilient so slugs are unique
});

// Name it 'Store', and apply storeSchema
module.exports = mongoose.model("Store", storeSchema);
