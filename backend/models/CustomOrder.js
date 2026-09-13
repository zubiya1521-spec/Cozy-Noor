const mongoose = require("mongoose");

const customOrderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
      validate: {
        validator: function (value) {
          return /^[0-9+\-\s()]{7,20}$/.test(value);
        },
        message: "Invalid phone number",
      },
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      maxlength: 150,
      validate: {
        validator: function (value) {
          if (!value) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: "Invalid email address",
      },
    },

    instagram: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    productType: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 2000,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 10000,
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number",
      },
    },

    size: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    colours: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 500,
    },

    material: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    designDetails: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    referenceImage: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    requiredDate: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    occasion: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    budget: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    status: {
      type: String,
      enum: [
        "New",
        "Reviewed",
        "Quoted",
        "Confirmed",
        "Completed",
        "Cancelled",
      ],
      default: "New",
    },
  },
  {
    timestamps: true,
  }
);

const CustomOrder = mongoose.model(
  "CustomOrder",
  customOrderSchema
);

module.exports = CustomOrder;