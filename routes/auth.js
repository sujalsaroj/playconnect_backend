const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  uploadProfilePic, // 👈 multer middleware
} = require("../controllers/controller");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Private routes
router.get("/me", protect, getMe);

// PUT route with multer middleware
router.put("/update", protect, uploadProfilePic, updateProfile);

module.exports = router;
