const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 30,
      match: /^[A-Z0-9_-]+$/,
    },

    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
      min: 0,
      max: 1000000,
    },

    applicability: {
      type: String,
      enum: ["all", "product", "category"],
      default: "all",
    },

    productIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    categories: {
      type: [String],
      default: [],
      validate: {
        validator: function (categories) {
          return (
            Array.isArray(categories) &&
            categories.length <= 50 &&
            categories.every(
              (category) =>
                typeof category === "string" &&
                category.trim().length >= 1 &&
                category.trim().length <= 100
            )
          );
        },
        message: "Invalid categories",
      },
    },

    minimumOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
      max: 10000000,
    },

    maximumDiscount: {
      type: Number,
      default: null,
      min: 0,
      max: 10000000,
    },

    startDate: {
      type: Date,
      default: null,
    },

    endDate: {
      type: Date,
      default: null,
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

// Extra validation for percentage discounts
offerSchema.pre("validate", function (next) {
  if (
    this.discountType === "percentage" &&
    this.discountValue > 100
  ) {
    return next(
      new Error("Percentage discount cannot exceed 100")
    );
  }

  if (
    this.startDate &&
    this.endDate &&
    this.endDate < this.startDate
  ) {
    return next(
      new Error("End date cannot be before start date")
    );
  }

  next();
});

const Offer = mongoose.model("Offer", offerSchema);

module.exports = Offer;