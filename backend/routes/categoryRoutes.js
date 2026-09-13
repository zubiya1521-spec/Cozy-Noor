const express = require("express");
const Category = require("../models/Category");
const requireAdmin = require("../middleware/authMiddleware");

const router = express.Router();

console.log("CATEGORY ROUTES FILE LOADED ✅");

/*
========================================
DEFAULT COZY NOOR CATEGORIES
========================================
*/

const defaultCategories = [
  {
    name: "Flowers & Bouquets",
    description:
      "Handmade flowers and beautiful bouquets that stay forever.",
    type: "main",
    image: "",
  },
  {
    name: "Bags & Pouches",
    description:
      "Pretty crochet bags and pouches made for everyday moments.",
    type: "main",
    image: "",
  },
  {
    name: "Hair Accessories",
    description:
      "Bows, gajras, scrunchies, headbands and more.",
    type: "main",
    image: "",
  },
  {
    name: "Keychains & Charms",
    description:
      "Tiny handmade pieces to add a little personality.",
    type: "main",
    image: "",
  },
  {
    name: "Amigurumi",
    description:
      "Cute little crochet characters made with love.",
    type: "main",
    image: "",
  },
  {
    name: "Home Décor",
    description:
      "Handmade crochet details to make your space feel cozy.",
    type: "main",
    image: "",
  },
  {
    name: "Baby & Kids",
    description:
      "Sweet handmade gifts, toys and accessories for little ones.",
    type: "main",
    image: "",
  },
  {
    name: "Custom & Personalized",
    description:
      "Have an idea? Let's turn your imagination into crochet.",
    type: "main",
    image: "",
  },
  {
    name: "Festive Celebrations",
    description:
      "Eid, Rakhi, Diwali, Christmas and festive creations.",
    type: "occasion",
    image: "",
  },
  {
    name: "Couples & Love",
    description:
      "Thoughtful creations for Valentine's, anniversaries and weddings.",
    type: "occasion",
    image: "",
  },
  {
    name: "Birthday",
    description:
      "Cute gifts, bouquets and personalised birthday creations.",
    type: "occasion",
    image: "",
  },
  {
    name: "Parents & Friends",
    description:
      "Special handmade gifts for the people who matter most.",
    type: "occasion",
    image: "",
  },
  {
    name: "Baby & Kids Occasions",
    description:
      "Baby shower, newborn and special little-one gifts.",
    type: "occasion",
    image: "",
  },
  {
    name: "National & Patriotic",
    description:
      "Handmade creations for Independence Day and Republic Day.",
    type: "occasion",
    image: "",
  },
];

/*
========================================
GET ALL CATEGORIES — PUBLIC
========================================
*/

router.get("/", async (req, res) => {
  try {
    for (const defaultCategory of defaultCategories) {
      await Category.findOneAndUpdate(
        {
          name: defaultCategory.name,
        },
        {
          $setOnInsert: defaultCategory,
        },
        {
          upsert: true,
          new: true,
        }
      );
    }

    const categories = await Category.find({
      active: true,
    }).sort({
      type: 1,
      createdAt: 1,
    });

    res.json(categories);
  } catch (error) {
    console.error(
      "Fetch categories error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
});

/*
========================================
ADD CATEGORY — ADMIN ONLY
========================================
*/

router.post("/", requireAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      image,
      type,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    const existingCategory =
      await Category.findOne({
        name: name.trim(),
      });

    if (existingCategory) {
      return res.status(400).json({
        message: "Category already exists",
      });
    }

    const category = new Category({
      name: name.trim(),
      description: description || "",
      image: image || "",
      type:
        type === "occasion"
          ? "occasion"
          : "main",
    });

    const savedCategory =
      await category.save();

    res.status(201).json({
      message: "Category added successfully",
      category: savedCategory,
    });
  } catch (error) {
    console.error(
      "Add category error:",
      error
    );

    res.status(500).json({
      message: "Failed to add category",
      error: error.message,
    });
  }
});

/*
========================================
DELETE CATEGORY — ADMIN ONLY
========================================
*/

router.delete(
  "/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const category =
        await Category.findByIdAndDelete(
          req.params.id
        );

      if (!category) {
        return res.status(404).json({
          message: "Category not found",
        });
      }

      res.json({
        message:
          "Category deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete category error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete category",
        error: error.message,
      });
    }
  }
);
/*
========================================
UPDATE CATEGORY — ADMIN ONLY
========================================
*/

router.put(
  "/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const {
        name,
        description,
        image,
        type,
        active,
      } = req.body;

      if (name !== undefined && !name.trim()) {
        return res.status(400).json({
          message: "Category name cannot be empty",
        });
      }

      const updateData = {};

      if (name !== undefined) {
        updateData.name = name.trim();
      }

      if (description !== undefined) {
        updateData.description =
          description.trim();
      }

      if (image !== undefined) {
        updateData.image = image;
      }

      if (type !== undefined) {
        updateData.type =
          type === "occasion"
            ? "occasion"
            : "main";
      }

      if (active !== undefined) {
        updateData.active = Boolean(active);
      }

      if (name !== undefined) {
        const duplicate =
          await Category.findOne({
            name: name.trim(),
            _id: {
              $ne: req.params.id,
            },
          });

        if (duplicate) {
          return res.status(400).json({
            message:
              "Another category with this name already exists",
          });
        }
      }

      const updatedCategory =
        await Category.findByIdAndUpdate(
          req.params.id,
          updateData,
          {
            new: true,
            runValidators: true,
          }
        );

      if (!updatedCategory) {
        return res.status(404).json({
          message: "Category not found",
        });
      }

      res.json({
        message:
          "Category updated successfully",
        category: updatedCategory,
      });
    } catch (error) {
      console.error(
        "Update category error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update category",
        error: error.message,
      });
    }
  }
);
module.exports = router;