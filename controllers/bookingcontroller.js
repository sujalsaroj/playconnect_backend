const Booking = require("../models/booking");
const Turf = require("../models/Turf");

// Book turf
exports.bookTurf = async (req, res) => {
  try {
    const { turfId, date, slot } = req.body;
    const userId = req.user.id;

    if (!turfId || !date || !slot) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const turf = await Turf.findById(turfId);
    if (!turf) return res.status(404).json({ message: "Turf not found" });

    // Ensure slot string compare
    const slotObj = turf.slots.find((s) => s.time === String(slot).trim());
    if (!slotObj) return res.status(404).json({ message: "Slot not found" });
    if (slotObj.booked)
      return res.status(400).json({ message: "Slot already booked" });

    slotObj.booked = true;
    await turf.save();

    const booking = new Booking({
      turfId,
      userId,
      date,
      slot: String(slot).trim(), // always save as string
      status: "Pending",
    });
    await booking.save();

    res.json({ message: "Booking successful", booking });
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ message: "Error booking turf" });
  }
};

// Get my bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).populate(
      "turfId"
    );
    res.json(bookings);
  } catch (error) {
    console.error("Get Bookings Error:", error);
    res.status(500).json({ message: "Error fetching bookings" });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const turf = await Turf.findById(booking.turfId);
    if (turf) {
      const slotObj = turf.slots.find((s) => s.time === booking.slot);
      if (slotObj) {
        slotObj.booked = false;
        await turf.save();
      }
    }

    booking.status = "Cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled" });
  } catch (error) {
    console.error("Cancel Booking Error:", error);
    res.status(500).json({ message: "Error cancelling booking" });
  }
};

exports.getBookingsForOwner = async (req, res) => {
  try {
    const turfs = await Turf.find({ owner: req.user.id });
    const turfIds = turfs.map((t) => t._id);

    // Only fetch bookings that are Pending or Confirmed
    const bookings = await Booking.find({
      turfId: { $in: turfIds },
      status: { $in: ["Pending", "Confirmed"] },
    }).populate("turfId userId");

    res.json(bookings);
  } catch (err) {
    console.error("Get Owner Bookings Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Confirm booking
exports.confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const turf = await Turf.findById(booking.turfId);
    if (!turf) return res.status(404).json({ message: "Turf not found" });

    if (!turf.owner || turf.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    booking.status = "Confirmed"; // ✅ fixed typo
    await booking.save();

    res.json({ message: "Booking confirmed", booking });
  } catch (err) {
    console.error("Confirm Booking Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
