const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  addTurf,
  getOwnerTurfs,
  deleteTurf,
  updateTurf,
  getAllTurfs,
} = require("../controllers/turfController");

const Turf = require("../models/Turf"); // ✅ for new endpoints
const bookingController = require("../controllers/bookingcontroller");
const { protect, ownerOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Ensure uploads dir exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "_");
    cb(null, Date.now() + "-" + safeName);
  },
});
const upload = multer({ storage });

// ====== Turf Routes ======

// Add new turf (owner only)
router.post("/add", protect, ownerOnly, upload.array("photos", 5), addTurf);

// Get all turfs of the logged-in owner
router.get("/my-turfs", protect, ownerOnly, getOwnerTurfs);

// Update turf (owner only), optional new photos
router.put("/:id", protect, ownerOnly, upload.array("photos", 5), updateTurf);

// Delete turf (owner only)
router.delete("/:id", protect, ownerOnly, deleteTurf);

// Get all turfs (public)
router.get("/", getAllTurfs);

// Extra APIs for dependent dropdown
router.get("/states", async (req, res) => {
  try {
    const states = await Turf.distinct("state");
    res.json(states);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/cities/:state", async (req, res) => {
  try {
    const cities = await Turf.distinct("city", { state: req.params.state });
    res.json(cities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user bookings
router.get("/bookings", bookingController.getMyBookings);

module.exports = router;
