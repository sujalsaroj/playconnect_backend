require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectedDB = require("./config/db");

const authRoutes = require("./routes/auth");
const DashboardRoutes = require("./routes/DashboardRoutes");
const turfRoutes = require("./routes/Turf");
const bookingRoutes = require("./routes/bookingroutes");
const connectionRoutes = require("./routes/connectionRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const contactRoutes = require("./routes/contactRoutes");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // Serve uploaded images

// Routes
app.use("/api", authRoutes);
app.use("/dashboard", DashboardRoutes);
app.use("/api/turf", turfRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api", contactRoutes);
const cors = require("cors");
// DB Connection
connectedDB();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
const cors = require("cors");
app.use(
  cors({
    origin: "https://playconnect-xi.vercel.app", // replace with your frontend URL
    credentials: true,
  })
);
