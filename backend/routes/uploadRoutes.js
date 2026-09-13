const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const requireAdmin = require("../middleware/authMiddleware");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(
        new Error("Only image files are allowed")
      );
    }

    cb(null, true);
  },
});

// UPLOAD IMAGE - ADMIN ONLY
router.post(
  "/",
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No image uploaded",
        });
      }

      const uploadStream =
        cloudinary.uploader.upload_stream(
          {
            folder: "cozy-noor/products",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              console.error(
                "Cloudinary upload error:",
                error
              );

              return res.status(500).json({
                message: "Image upload failed",
                error: error.message,
              });
            }

            res.status(200).json({
              message:
                "Image uploaded successfully",
              imageUrl: result.secure_url,
            });
          }
        );

      uploadStream.end(req.file.buffer);
    } catch (error) {
      console.error(
        "Upload error:",
        error
      );

      res.status(500).json({
        message: "Image upload failed",
        error: error.message,
      });
    }
  }
);

// MULTER / FILE VALIDATION ERRORS
router.use((error, req, res, next) => {
  if (error) {
    return res.status(400).json({
      message:
        error.message ||
        "Invalid image upload",
    });
  }

  next();
});

module.exports = router;