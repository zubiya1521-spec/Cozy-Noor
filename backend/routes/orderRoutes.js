const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Offer = require("../models/Offer");
const requireAdmin = require("../middleware/authMiddleware");
const requireUser = require("../middleware/userAuthMiddleware");

const router = express.Router();

console.log("ORDER ROUTES FILE LOADED ✅");

const VALID_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Ready",
  "Shipped",
  "Delivered",
  "Cancelled",
];

// CREATE ORDER
router.post("/", requireUser, async (req, res) => {
  try {
    console.log("CREATE ORDER REQUEST RECEIVED 🚀");

    const {
      userId,
      customerName,
      email,
      phone,
      address,
      items,
      offerCode,
      deliveryCharge,
    } = req.body;

    // BASIC VALIDATION
    if (
      !userId ||
      !customerName ||
      !email ||
      !phone ||
      !address
    ) {
      return res.status(400).json({
        message: "Please provide all customer details",
      });
    }

    // CUSTOMER CAN ONLY CREATE ORDER FOR THEIR OWN ACCOUNT
    if (userId !== req.user.userId) {
      return res.status(403).json({
        message: "You can only create orders for your own account",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "At least one product is required",
      });
    }

    // VALIDATE PRODUCTS AND USE DATABASE PRICES
    const validatedItems = [];

    for (const item of items) {
      if (!item.productId) {
        return res.status(400).json({
          message: "Invalid product",
        });
      }

      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(400).json({
          message: "One or more products no longer exist",
        });
      }

      const quantity = Number(item.quantity || 1);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          message: "Invalid product quantity",
        });
      }

      validatedItems.push({
        productId: product._id,
        productName: product.name,
        quantity,
        price: Number(product.price),
        image: item.image || product.images?.[0] || "",
        category: product.category,
      });
    }

    // CALCULATE SUBTOTAL FROM DATABASE PRICES
    const calculatedSubtotal = validatedItems.reduce(
      (total, item) =>
        total +
        Number(item.price) * Number(item.quantity),
      0
    );

    // VERIFY OFFER ON SERVER
    let appliedOffer = null;
    let safeDiscountAmount = 0;

    if (offerCode && offerCode.trim()) {
      const offer = await Offer.findOne({
        code: offerCode.trim().toUpperCase(),
        active: true,
      });

      if (!offer) {
        return res.status(400).json({
          message: "Invalid or inactive offer code",
        });
      }

      const now = new Date();

      if (
        offer.startDate &&
        now < new Date(offer.startDate)
      ) {
        return res.status(400).json({
          message: "This offer has not started yet",
        });
      }

      if (
        offer.endDate &&
        now > new Date(offer.endDate)
      ) {
        return res.status(400).json({
          message: "This offer has expired",
        });
      }

      // MINIMUM ORDER AMOUNT
      if (
        calculatedSubtotal <
        Number(offer.minimumOrderAmount || 0)
      ) {
        return res.status(400).json({
          message: `Minimum order amount is ₹${Number(
            offer.minimumOrderAmount || 0
          ).toLocaleString("en-IN")}`,
        });
      }

      let eligibleAmount = 0;

      // OFFER APPLIES TO ALL PRODUCTS
      if (offer.applicability === "all") {
        eligibleAmount = calculatedSubtotal;
      }

      // OFFER APPLIES TO SPECIFIC PRODUCTS
      if (offer.applicability === "product") {
        eligibleAmount = validatedItems
          .filter((item) =>
            offer.productIds.some(
              (productId) =>
                String(productId) ===
                String(item.productId)
            )
          )
          .reduce(
            (total, item) =>
              total +
              Number(item.price) *
                Number(item.quantity),
            0
          );
      }

      // OFFER APPLIES TO SPECIFIC CATEGORIES
      if (offer.applicability === "category") {
        eligibleAmount = validatedItems
          .filter((item) =>
            offer.categories.includes(item.category)
          )
          .reduce(
            (total, item) =>
              total +
              Number(item.price) *
                Number(item.quantity),
            0
          );
      }

      if (eligibleAmount <= 0) {
        return res.status(400).json({
          message:
            "This offer does not apply to the selected products",
        });
      }

      // CALCULATE DISCOUNT
      if (offer.discountType === "percentage") {
        safeDiscountAmount =
          (eligibleAmount *
            Number(offer.discountValue)) /
          100;
      } else {
        safeDiscountAmount =
          Number(offer.discountValue);
      }

      // MAXIMUM DISCOUNT LIMIT
      if (
        offer.maximumDiscount !== null &&
        offer.maximumDiscount !== undefined
      ) {
        safeDiscountAmount = Math.min(
          safeDiscountAmount,
          Number(offer.maximumDiscount)
        );
      }

      // DISCOUNT CANNOT EXCEED ORDER SUBTOTAL
      safeDiscountAmount = Math.min(
        safeDiscountAmount,
        calculatedSubtotal
      );

      safeDiscountAmount = Number(
        safeDiscountAmount.toFixed(2)
      );

      appliedOffer = offer;
    }

    // CALCULATE DISCOUNTED SUBTOTAL
    const calculatedDiscountedSubtotal =
      Math.max(
        0,
        calculatedSubtotal - safeDiscountAmount
      );

    // DELIVERY CHARGE
    // Admin can decide/update this later.
    const safeDeliveryCharge = Math.max(
      0,
      Number(deliveryCharge || 0)
    );

    // FINAL TOTAL
    const calculatedTotalAmount =
      calculatedDiscountedSubtotal +
      safeDeliveryCharge;

    // CREATE ORDER
    const orderData = {
      userId: req.user.userId,

      customerName: customerName.trim(),

      email: email.trim().toLowerCase(),

      phone: phone.trim(),

      address: address.trim(),

      items: validatedItems,

      subtotal: calculatedSubtotal,

      offerCode: appliedOffer
        ? appliedOffer.code
        : "",

      offerName: appliedOffer
        ? appliedOffer.name
        : "",

      discountAmount: safeDiscountAmount,

      discountedSubtotal:
        calculatedDiscountedSubtotal,

      deliveryCharge: safeDeliveryCharge,

      totalAmount: calculatedTotalAmount,

      // OFFLINE / COD ONLY
      paymentMethod: "COD",

      paymentStatus: "Pending",

      orderStatus: "Pending",

      statusHistory: [
        {
          status: "Pending",
          updatedAt: new Date(),
        },
      ],
    };

    const order = new Order(orderData);

    const savedOrder = await order.save();

    console.log("ORDER SAVED ✅", savedOrder._id);

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error(
      "Order creation error ❌:",
      error
    );

    res.status(500).json({
      message: "Failed to create order",
    });
  }
});
// GET ALL ORDERS FOR ADMIN
router.get(
  "/",
  requireAdmin,
  async (req, res) => {
    try {
      const orders = await Order.find({})
        .populate("items.productId")
        .sort({ createdAt: -1 });

      res.json(orders);
    } catch (error) {
      console.error(
        "Fetch all admin orders error ❌:",
        error
      );

      res.status(500).json({
        message: "Failed to fetch all orders",
      });
    }
  }
);
// GET ORDERS OF ONE USER
router.get(
  "/user/:userId",
  requireUser,
  async (req, res) => {
    try {
      if (req.user.userId !== req.params.userId) {
        return res.status(403).json({
          message: "You can only access your own orders",
        });
      }

      const orders = await Order.find({
        userId: req.params.userId,
      })
        .populate("items.productId")
        .sort({ createdAt: -1 });

      res.json(orders);
    } catch (error) {
      console.error(
        "Fetch user orders error:",
        error
      );

      res.status(500).json({
        message: "Failed to fetch user orders",
      });
    }
  }
);

// GET ONE ORDER
router.get(
  "/:id",
  requireUser,
  async (req, res) => {
    try {
      const order = await Order.findById(
        req.params.id
      ).populate("items.productId");

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      // CUSTOMER CAN ONLY VIEW THEIR OWN ORDER
      if (
        order.userId.toString() !==
        req.user.userId
      ) {
        return res.status(403).json({
          message:
            "You can only access your own order",
        });
      }

      res.json(order);
    } catch (error) {
      console.error(
        "Fetch order error:",
        error
      );

      res.status(500).json({
        message: "Failed to fetch order",
      });
    }
  }
);

// CANCEL ORDER
router.put(
  "/:id/cancel",
  requireUser,
  async (req, res) => {
    try {
      const order = await Order.findById(
        req.params.id
      );

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      // CUSTOMER CAN ONLY CANCEL THEIR OWN ORDER
      if (
        order.userId.toString() !==
        req.user.userId
      ) {
        return res.status(403).json({
          message:
            "You can only cancel your own order",
        });
      }

      if (
        !["Pending", "Confirmed"].includes(
          order.orderStatus
        )
      ) {
        return res.status(400).json({
          message:
            "This order cannot be cancelled now",
        });
      }

      order.orderStatus = "Cancelled";

      if (!order.statusHistory) {
        order.statusHistory = [];
      }

      order.statusHistory.push({
        status: "Cancelled",
        updatedAt: new Date(),
      });

      await order.save();

      res.json({
        message:
          "Order cancelled successfully",
        order,
      });
    } catch (error) {
      console.error(
        "Cancel order error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to cancel order",
      });
    }
  }
);

// UPDATE DELIVERY CHARGE
router.put(
  "/:id/delivery-charge",
  requireAdmin,
  async (req, res) => {
    try {
      const deliveryCharge = Number(
        req.body.deliveryCharge
      );

      if (
        Number.isNaN(deliveryCharge) ||
        deliveryCharge < 0
      ) {
        return res.status(400).json({
          message:
            "Please enter a valid delivery charge",
        });
      }

      const order = await Order.findById(
        req.params.id
      );

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      let subtotal = Number(
        order.subtotal || 0
      );

      // FOR OLDER ORDERS
      if (
        subtotal === 0 &&
        order.items &&
        order.items.length > 0
      ) {
        subtotal = order.items.reduce(
          (total, item) =>
            total +
            Number(item.price || 0) *
              Number(item.quantity || 1),
          0
        );
      }

      const discountAmount = Number(
        order.discountAmount || 0
      );

      const discountedSubtotal = Math.max(
        0,
        subtotal - discountAmount
      );

      const totalAmount =
        discountedSubtotal +
        deliveryCharge;

      const updatedOrder =
        await Order.findByIdAndUpdate(
          req.params.id,
          {
            subtotal,
            discountedSubtotal,
            deliveryCharge,
            totalAmount,
          },
          {
            new: true,
            runValidators: true,
          }
        );

      res.json({
        message:
          "Delivery charge updated successfully",
        order: updatedOrder,
      });
    } catch (error) {
      console.error(
        "Delivery charge update error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update delivery charge",
      });
    }
  }
);

// DELETE ALL ORDERS
router.delete(
  "/admin/delete-all",
  requireAdmin,
  async (req, res) => {
    try {
      const result =
        await Order.deleteMany({});

      res.json({
        message:
          "All orders deleted successfully",
        deletedCount:
          result.deletedCount,
      });
    } catch (error) {
      console.error(
        "Delete all orders error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete all orders",
      });
    }
  }
);

// UPDATE ORDER STATUS
router.put(
  "/:id/status",
  requireAdmin,
  async (req, res) => {
    try {
      const { orderStatus } = req.body;

      if (
        !VALID_STATUSES.includes(orderStatus)
      ) {
        return res.status(400).json({
          message: "Invalid order status",
        });
      }

      const order = await Order.findById(
        req.params.id
      );

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      const oldStatus = order.orderStatus;

      order.orderStatus = orderStatus;

      if (!order.statusHistory) {
        order.statusHistory = [];
      }

      if (oldStatus !== orderStatus) {
        order.statusHistory.push({
          status: orderStatus,
          updatedAt: new Date(),
        });
      }

      await order.save();

      res.json({
        message:
          "Order status updated successfully",
        order,
      });
    } catch (error) {
      console.error(
        "Update status error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update status",
      });
    }
  }
);

module.exports = router;