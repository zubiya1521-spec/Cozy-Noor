const express = require("express");
const Offer = require("../models/Offer");
const requireAdmin = require("../middleware/authMiddleware");
const router = express.Router();

console.log("OFFER ROUTES LOADED ✅");

// GET ALL OFFERS
router.get("/", requireAdmin, async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate("productIds", "name price")
      .sort({ createdAt: -1 });

    res.json(offers);
  } catch (error) {
    console.error("Fetch offers error:", error);

    res.status(500).json({
      message: "Failed to fetch offers",
      error: error.message,
    });
  }
});

// CREATE OFFER
router.post("/", requireAdmin,async (req, res) => {
  try {
    const {
      name,
      code,
      discountType,
      discountValue,
      applicability,
      productIds,
      categories,
      minimumOrderAmount,
      maximumDiscount,
      startDate,
      endDate,
      active,
    } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        message: "Offer name and code are required",
      });
    }

    if (
      !discountType ||
      !["percentage", "fixed"].includes(discountType)
    ) {
      return res.status(400).json({
        message: "Invalid discount type",
      });
    }

    if (
      discountValue === undefined ||
      Number(discountValue) <= 0
    ) {
      return res.status(400).json({
        message: "Discount value must be greater than 0",
      });
    }

    if (
      discountType === "percentage" &&
      Number(discountValue) > 100
    ) {
      return res.status(400).json({
        message: "Percentage discount cannot exceed 100%",
      });
    }

    const existingOffer = await Offer.findOne({
      code: code.trim().toUpperCase(),
    });

    if (existingOffer) {
      return res.status(400).json({
        message: "Offer code already exists",
      });
    }

    const offer = new Offer({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      applicability: applicability || "all",
      productIds: productIds || [],
      categories: categories || [],
      minimumOrderAmount: Number(minimumOrderAmount || 0),
      maximumDiscount:
        maximumDiscount === "" ||
        maximumDiscount === null ||
        maximumDiscount === undefined
          ? null
          : Number(maximumDiscount),
      startDate: startDate || null,
      endDate: endDate || null,
      active: active !== false,
    });

    const savedOffer = await offer.save();

    res.status(201).json({
      message: "Offer created successfully",
      offer: savedOffer,
    });
  } catch (error) {
    console.error("Create offer error:", error);

    res.status(500).json({
      message: "Failed to create offer",
      error: error.message,
    });
  }
});

// UPDATE OFFER
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const {
      name,
      code,
      discountType,
      discountValue,
      applicability,
      productIds,
      categories,
      minimumOrderAmount,
      maximumDiscount,
      startDate,
      endDate,
      active,
    } = req.body;

    if (
      discountType &&
      !["percentage", "fixed"].includes(discountType)
    ) {
      return res.status(400).json({
        message: "Invalid discount type",
      });
    }

    if (
      discountType === "percentage" &&
      Number(discountValue) > 100
    ) {
      return res.status(400).json({
        message: "Percentage discount cannot exceed 100%",
      });
    }

    const updatedOffer =
      await Offer.findByIdAndUpdate(
        req.params.id,
        {
          name: name?.trim(),
          code: code?.trim().toUpperCase(),
          discountType,
          discountValue:
            discountValue !== undefined
              ? Number(discountValue)
              : undefined,
          applicability,
          productIds,
          categories,
          minimumOrderAmount:
            minimumOrderAmount !== undefined
              ? Number(minimumOrderAmount)
              : undefined,
          maximumDiscount:
            maximumDiscount === "" ||
            maximumDiscount === null
              ? null
              : maximumDiscount !== undefined
              ? Number(maximumDiscount)
              : undefined,
          startDate: startDate || null,
          endDate: endDate || null,
          active,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedOffer) {
      return res.status(404).json({
        message: "Offer not found",
      });
    }

    res.json({
      message: "Offer updated successfully",
      offer: updatedOffer,
    });
  } catch (error) {
    console.error("Update offer error:", error);

    res.status(500).json({
      message: "Failed to update offer",
      error: error.message,
    });
  }
});

// DELETE OFFER
router.delete("/:id", requireAdmin,async (req, res) => {
  try {
    const deletedOffer =
      await Offer.findByIdAndDelete(req.params.id);

    if (!deletedOffer) {
      return res.status(404).json({
        message: "Offer not found",
      });
    }

    res.json({
      message: "Offer deleted successfully",
    });
  } catch (error) {
    console.error("Delete offer error:", error);

    res.status(500).json({
      message: "Failed to delete offer",
      error: error.message,
    });
  }
});
// CALCULATE OFFER DISCOUNT
router.post("/calculate", async (req, res) => {
  try {
    const {
      code,
      items = [],
      subtotal = 0,
    } = req.body;

    if (!code) {
      return res.status(400).json({
        message: "Offer code is required",
      });
    }

    const offer = await Offer.findOne({
      code: code.trim().toUpperCase(),
      active: true,
    });

    if (!offer) {
      return res.status(404).json({
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

    if (
      Number(subtotal) <
      Number(offer.minimumOrderAmount || 0)
    ) {
      return res.status(400).json({
        message: `Minimum order amount is ₹${Number(
          offer.minimumOrderAmount
        ).toLocaleString("en-IN")}`,
      });
    }

    let eligibleAmount = 0;

    if (offer.applicability === "all") {
      eligibleAmount = Number(subtotal);
    }

    if (offer.applicability === "product") {
      eligibleAmount = items
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
            Number(item.price || 0) *
              Number(item.quantity || 1),
          0
        );
    }

    if (offer.applicability === "category") {
      eligibleAmount = items
        .filter((item) =>
          offer.categories.includes(
            item.category
          )
        )
        .reduce(
          (total, item) =>
            total +
            Number(item.price || 0) *
              Number(item.quantity || 1),
          0
        );
    }

    if (eligibleAmount <= 0) {
      return res.status(400).json({
        message:
          "This offer does not apply to the selected products",
      });
    }

    let discount = 0;

    if (offer.discountType === "percentage") {
      discount =
        (eligibleAmount *
          Number(offer.discountValue)) /
        100;
    } else {
      discount = Number(
        offer.discountValue
      );
    }

    if (
      offer.maximumDiscount !== null &&
      offer.maximumDiscount !== undefined
    ) {
      discount = Math.min(
        discount,
        Number(offer.maximumDiscount)
      );
    }

    discount = Math.min(
      discount,
      Number(subtotal)
    );

    const finalAmount =
      Number(subtotal) - discount;

    res.json({
      success: true,
      offer: {
        id: offer._id,
        name: offer.name,
        code: offer.code,
        discountType: offer.discountType,
        discountValue: offer.discountValue,
      },
      subtotal: Number(subtotal),
      discount: Number(discount.toFixed(2)),
      finalAmount: Number(
        finalAmount.toFixed(2)
      ),
    });
  } catch (error) {
    console.error(
      "Calculate offer error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to calculate offer",
      error: error.message,
    });
  }
});
module.exports = router;