const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      max: 1000000,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 2000,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
      max: 100000,
      validate: {
        validator: Number.isInteger,
        message: "Stock must be a whole number",
      },
    },

    colours: {
      type: [String],
      default: [],
      validate: {
        validator: function (colours) {
          return (
            Array.isArray(colours) &&
            colours.length <= 50 &&
            colours.every(
              (colour) =>
                typeof colour === "string" &&
                colour.trim().length > 0 &&
                colour.trim().length <= 50
            )
          );
        },
        message: "Invalid colours",
      },
    },

    sizes: {
      type: [String],
      default: [],
      validate: {
        validator: function (sizes) {
          return (
            Array.isArray(sizes) &&
            sizes.length <= 50 &&
            sizes.every(
              (size) =>
                typeof size === "string" &&
                size.trim().length > 0 &&
                size.trim().length <= 50
            )
          );
        },
        message: "Invalid sizes",
      },
    },

    customization: {
      type: Boolean,
      default: false,
    },

    makingTime: {
      type: String,
      default: "10–15 days",
      trim: true,
      maxlength: 100,
    },

    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (images) {
          return (
            Array.isArray(images) &&
            images.length <= 10 &&
            images.every(
              (image) =>
                typeof image === "string" &&
                image.trim().length > 0 &&
                image.trim().length <= 1000
            )
          );
        },
        message: "Invalid product images",
      },
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;