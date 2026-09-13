const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
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

    price: {
      type: Number,
      required: true,
      min: 0,
      max: 1000000,
    },

    image: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    category: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Processing",
        "Ready",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      required: true,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
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

    address: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 500,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: function (items) {
          return Array.isArray(items) && items.length > 0 && items.length <= 100;
        },
        message: "Order must contain 1 to 100 items",
      },
    },

    subtotal: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 10000000,
    },

    offerCode: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
      maxlength: 30,
    },

    offerName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
      max: 10000000,
    },

    discountedSubtotal: {
      type: Number,
      default: 0,
      min: 0,
      max: 10000000,
    },

    deliveryCharge: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 1000000,
    },

    totalAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 10000000,
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "Online"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Processing",
        "Ready",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    statusHistory: {
      type: [statusHistorySchema],
      default: function () {
        return [
          {
            status: "Pending",
            updatedAt: new Date(),
          },
        ];
      },
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;