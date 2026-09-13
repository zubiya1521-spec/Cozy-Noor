const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    image: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
      validate: {
        validator: function (value) {
          if (!value) return true;

          return /^https?:\/\/\S+$/i.test(value);
        },
        message: "Invalid category image URL",
      },
    },

    type: {
      type: String,
      enum: ["main", "occasion"],
      default: "main",
    },

    emoji: {
      type: String,
      default: "✿",
      trim: true,
      maxlength: 10,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model(
  "Category",
  categorySchema
);

module.exports = Category;