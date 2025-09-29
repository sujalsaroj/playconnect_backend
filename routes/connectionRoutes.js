const express = require("express");
const router = express.Router();
const Connection = require("../models/connection");
const { protect } = require("../middleware/authMiddleware");

// 1️⃣ Raise a new connection
router.post("/", protect, async (req, res) => {
  try {
    const { turf, date, maxPlayers } = req.body;
    const userId = req.user.id;

    const connection = new Connection({
      turf,
      date,
      maxPlayers,
      createdBy: userId,
      players: [userId],
    });

    await connection.save();
    res.status(201).json(connection);
  } catch (err) {
    console.error("❌ Raise connection error:", err);
    res.status(500).json({ message: "Server error while raising connection" });
  }
});

// 2️⃣ Get all open connections
router.get("/open", protect, async (req, res) => {
  try {
    const connections = await Connection.find({ status: "open" }).populate(
      "players",
      "name email"
    );
    res.json(connections);
  } catch (err) {
    console.error("❌ Fetch open connections error:", err);
    res
      .status(500)
      .json({ message: "Server error while fetching connections" });
  }
});

// 3️⃣ Join a connection
router.post("/:id/join", protect, async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);
    if (!connection)
      return res.status(404).json({ message: "Connection not found" });

    if (connection.status === "filled") {
      return res.status(400).json({ message: "Connection is already filled" });
    }

    const userId = req.user.id;

    // ✅ FIX: Proper ObjectId comparison
    const alreadyJoined = connection.players.some(
      (p) => p.toString() === userId.toString()
    );

    if (alreadyJoined) {
      return res.status(400).json({ message: "Already joined" });
    }

    if (connection.players.length >= connection.maxPlayers) {
      return res.status(400).json({ message: "Max players reached" });
    }

    connection.players.push(userId);

    if (connection.players.length === connection.maxPlayers) {
      connection.status = "full";
    }

    await connection.save();
    res.json(connection);
  } catch (err) {
    console.error("❌ Join route error:", err);
    res.status(500).json({ message: "Server error while joining connection" });
  }
});
// 4️⃣ Get my connections (created or joined)
router.get("/my", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const myConnections = await Connection.find({
      $or: [{ createdBy: userId }, { players: userId }],
    })
      .populate("players", "name email")
      .populate("createdBy", "name email");

    res.json(myConnections);
  } catch (err) {
    console.error("❌ Fetch my connections error:", err);
    res
      .status(500)
      .json({ message: "Server error while fetching my connections" });
  }
});

module.exports = router;
