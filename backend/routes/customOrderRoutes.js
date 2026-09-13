const express = require("express");
const CustomOrder = require("../models/CustomOrder");
const requireAdmin = require("../middleware/authMiddleware");

const router = express.Router();

console.log("CUSTOM ORDER ROUTES LOADED ✅");

// CREATE CUSTOM ORDER - PUBLIC
router.post("/", async (req, res) => {
  try {
    console.log("CUSTOM ORDER RECEIVED 🚀");
    console.log(req.body);

    const customOrder = new CustomOrder(req.body);

    const savedOrder = await customOrder.save();

    console.log(
      "CUSTOM ORDER SAVED ✅",
      savedOrder._id
    );

    res.status(201).json({
      message:
        "Custom order request submitted successfully",
      order: savedOrder,
    });
  } catch (error) {
    console.error(
      "Custom order error ❌:",
      error
    );

    res.status(500).json({
      message: "Failed to submit custom order",
      error: error.message,
    });
  }
});

// GET ALL CUSTOM ORDERS - ADMIN ONLY
router.get("/", requireAdmin, async (req, res) => {
  try {
    const orders = await CustomOrder.find()
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error(
      "Fetch custom orders error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch custom orders",
      error: error.message,
    });
  }
});

// GET ONE CUSTOM ORDER - ADMIN ONLY
router.get(
  "/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const order = await CustomOrder.findById(
        req.params.id
      );

      if (!order) {
        return res.status(404).json({
          message: "Custom order not found",
        });
      }

      res.json(order);
    } catch (error) {
      console.error(
        "Fetch custom order error:",
        error
      );

      res.status(500).json({
        message: "Failed to fetch custom order",
        error: error.message,
      });
    }
  }
);

// UPDATE CUSTOM ORDER STATUS - ADMIN ONLY
router.put(
  "/:id/status",
  requireAdmin,
  async (req, res) => {
    try {
      const { status } = req.body;

      const validStatuses = [
        "New",
        "Reviewed",
        "Quoted",
        "Confirmed",
        "In process",
        "Completed",
        "Cancelled",
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid custom order status",
        });
      }

      const order = await CustomOrder.findById(
        req.params.id
      );

      if (!order) {
        return res.status(404).json({
          message: "Custom order not found",
        });
      }

      order.status = status;

      await order.save();

      res.json({
        message:
          "Custom order status updated successfully",
        order,
      });
    } catch (error) {
      console.error(
        "Custom order status error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update custom order status",
        error: error.message,
      });
    }
  }
);

// DELETE CUSTOM ORDER - ADMIN ONLY
router.delete(
  "/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const order =
        await CustomOrder.findByIdAndDelete(
          req.params.id
        );

      if (!order) {
        return res.status(404).json({
          message: "Custom order not found",
        });
      }

      res.json({
        message:
          "Custom order deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete custom order error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete custom order",
      });
    }
  }
);

module.exports = router;