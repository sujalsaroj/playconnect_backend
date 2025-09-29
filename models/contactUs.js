const mongoose = require("mongoose");

const contactUsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    message: { type: String, required: true },
  },
  { timestamps: true } // will automatically add createdAt & updatedAt
);

module.exports = mongoose.model("ContactUs", contactUsSchema);
