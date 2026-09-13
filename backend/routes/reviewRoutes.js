const express = require("express");
const Review = require("../models/Review");
const requireAdmin = require("../middleware/authMiddleware");

const router = express.Router();

console.log("REVIEW ROUTES LOADED ✅");

/*
====================================================
CREATE REVIEW — PUBLIC
Customer website se review submit kar sakta hai.
====================================================
*/

router.post("/", async (req, res) => {
  try {
    const review = new Review(req.body);

    const savedReview = await review.save();

    res.status(201).json({
      message: "Review submitted successfully",
      review: savedReview,
    });
  } catch (error) {
    console.error(
      "Create review error:",
      error
    );

    res.status(500).json({
      message: "Failed to submit review",
      error: error.message,
    });
  }
});

/*
====================================================
GET APPROVED REVIEWS — PUBLIC
Website par customers ko approved reviews dikhane ke liye.
====================================================
*/

router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find({
      approved: true,
    }).sort({
      createdAt: -1,
    });

    res.json(reviews);
  } catch (error) {
    console.error(
      "Fetch reviews error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
});

/*
====================================================
GET ALL REVIEWS — ADMIN ONLY
====================================================
*/

router.get(
  "/admin/all",
  requireAdmin,
  async (req, res) => {
    try {
      const reviews = await Review.find()
        .populate("productId")
        .sort({
          createdAt: -1,
        });

      res.json(reviews);
    } catch (error) {
      console.error(
        "Fetch admin reviews error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch admin reviews",
        error: error.message,
      });
    }
  }
);

/*
====================================================
APPROVE / HIDE REVIEW — ADMIN ONLY
====================================================
*/

router.put(
  "/:id/approval",
  requireAdmin,
  async (req, res) => {
    try {
      const { approved } = req.body;

      const review =
        await Review.findById(
          req.params.id
        );

      if (!review) {
        return res.status(404).json({
          message: "Review not found",
        });
      }

      review.approved =
        Boolean(approved);

      await review.save();

      res.json({
        message: review.approved
          ? "Review approved successfully"
          : "Review hidden successfully",
        review,
      });
    } catch (error) {
      console.error(
        "Review approval error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update review",
        error: error.message,
      });
    }
  }
);

/*
====================================================
DELETE REVIEW — ADMIN ONLY
====================================================
*/

router.delete(
  "/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const review =
        await Review.findByIdAndDelete(
          req.params.id
        );

      if (!review) {
        return res.status(404).json({
          message: "Review not found",
        });
      }

      res.json({
        message:
          "Review deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete review error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete review",
        error: error.message,
      });
    }
  }
);

module.exports = router;