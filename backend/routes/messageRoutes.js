const express = require("express");
const Message = require("../models/Message");
const requireAdmin = require("../middleware/authMiddleware");

const router = express.Router();

console.log("MESSAGE ROUTES LOADED ✅");

// CREATE MESSAGE - PUBLIC
router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      subject,
      message,
    } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        message:
          "Name, email and message are required",
      });
    }

    const newMessage = new Message({
      name,
      email,
      phone: phone || "",
      subject: subject || "",
      message,
    });

    const savedMessage =
      await newMessage.save();

    res.status(201).json({
      message:
        "Message sent successfully",
      data: savedMessage,
    });
  } catch (error) {
    console.error(
      "Create message error:",
      error
    );

    res.status(500).json({
      message: "Failed to send message",
      error: error.message,
    });
  }
});

// GET ALL MESSAGES - ADMIN ONLY
router.get("/", requireAdmin, async (req, res) => {
  try {
    const messages = await Message.find()
      .sort({
        createdAt: -1,
      });

    res.json(messages);
  } catch (error) {
    console.error(
      "Fetch messages error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch messages",
      error: error.message,
    });
  }
});

// MARK AS READ / UNREAD - ADMIN ONLY
router.put(
  "/:id/read",
  requireAdmin,
  async (req, res) => {
    try {
      const { read } = req.body;

      const message =
        await Message.findById(
          req.params.id
        );

      if (!message) {
        return res.status(404).json({
          message: "Message not found",
        });
      }

      message.read = Boolean(read);

      await message.save();

      res.json({
        message:
          message.read
            ? "Message marked as read"
            : "Message marked as unread",
        data: message,
      });
    } catch (error) {
      console.error(
        "Update message error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update message",
        error: error.message,
      });
    }
  }
);

// DELETE MESSAGE - ADMIN ONLY
router.delete(
  "/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const message =
        await Message.findByIdAndDelete(
          req.params.id
        );

      if (!message) {
        return res.status(404).json({
          message: "Message not found",
        });
      }

      res.json({
        message:
          "Message deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete message error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete message",
      });
    }
  }
);

module.exports = router;