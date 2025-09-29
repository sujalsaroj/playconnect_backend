const mongoose = require("mongoose");

// User ka schema banate hain
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["player", "owner", "admin"],
      default: "player",
    },

    // Extra profile fields
    phone: { type: String },
    address: { type: String },
    dob: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"] },
    profilePic: { type: String },
    isProfileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
