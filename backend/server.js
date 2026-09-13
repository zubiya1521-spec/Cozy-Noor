const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const productRoutes = require("./routes/productRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const customOrderRoutes = require("./routes/customOrderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const messageRoutes = require("./routes/messageRoutes");
const offerRoutes = require("./routes/offerRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/user", customOrderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/custom-orders", customOrderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/offers", offerRoutes);

// ADMIN AUTHENTICATION
app.use("/api/admin", adminRoutes);

app.post("/api/users/test", (req, res) => {
  res.json({
    message: "User POST route is working ✅",
  });
});

app.get("/api/test", (req, res) => {
  res.send("API is working! ✅");
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully! ✅");
  })
  .catch((error) => {
    console.log("MongoDB Connection Failed ❌");
    console.log(error.message);
  });

// Test Route
app.get("/", (req, res) => {
  res.send("Cozy Noor Backend is Running! 🧶");
});

app.listen(PORT, () => {
  console.log(
    `Cozy Noor Backend running on http://localhost:${PORT}`
  );
});