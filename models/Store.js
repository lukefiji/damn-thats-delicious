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
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: "Point"
    },
    coordinates: [
      {
        type: Number,
        required: "You must supply coordinates!"
      }
    ],
    address: {
      type: String,
      required: "You must supply an address!"
    }
  },
  photo: String
});

// Save name as slug on save
storeSchema.pre("save", async function(next) {
  // Skip if name isn't changed
  if (!this.isModified("name")) {
    return next(); // Return to break out of function
  }
  this.slug = slug(this.name);
  // Find other stores that have a slug of name, name-1, name-2
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, "i");
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx });

  // if slug exists
  if (storesWithSlug.length) {
    // Return the next slug number
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }
  next();
});

// Name it 'Store', and apply storeSchema
module.exports = mongoose.model("Store", storeSchema);
