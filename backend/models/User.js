const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 150,
      validate: {
        validator: function (value) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: "Invalid email address",
      },
    },

    phone: {
      type: String,
      default: "",
      trim: true,
      maxlength: 20,
      validate: {
        validator: function (value) {
          if (!value) return true;
          return /^[0-9+\-\s()]{7,20}$/.test(value);
        },
        message: "Invalid phone number",
      },
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 200,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;