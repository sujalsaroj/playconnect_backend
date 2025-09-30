// controllers/paymentController.js
const Stripe = require("stripe");
const Booking = require("../models/booking");
const Turf = require("../models/Turf");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create checkout session
exports.createCheckoutSession = async (req, res) => {
  try {
    const { turfId, slot, date } = req.body;
    const userId = req.user.id || req.user._id;

    if (!userId) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const turf = await Turf.findById(turfId);
    if (!turf) {
      return res.status(404).json({ message: "Turf not found" });
    }

    // Create booking entry with Pending status
    const booking = await Booking.create({
      turfId,
      userId,
      date,
      slot,
      status: "Pending",
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: turf.name,
              description: `Booking slot: ${slot} on ${date}`,
            },
            unit_amount: turf.price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://https://playconnect-backend.vercel.app/5173/success?bookingId=${booking._id}`,
      cancel_url: "http://https://playconnect-backend.vercel.app/5173/cancel",
    });

    res.json({ id: session.id, url: session.url, bookingId: booking._id });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ message: "Payment failed" });
  }
};

// Confirm booking after success
exports.confirmBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = "Pending";
    await booking.save();

    // Mark slot as booked inside Turf
    await Turf.updateOne(
      { _id: booking.turfId, "slots.time": booking.slot },
      { $set: { "slots.$.booked": true } }
    );

    res.json({ message: "Booking confirmed", booking });
  } catch (err) {
    console.error("Confirm booking error:", err);
    res.status(500).json({ message: "Failed to confirm booking" });
  }
};
