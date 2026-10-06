const mongoose = require("mongoose");

const passwordResetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  otp: {
    type: String,
    required: true,
  },

  expiresAt: {
    type: Date,
    required: true,
  },

  attempts: {
    type: Number,
    default: 0,
  },

  verified: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model(
  "PasswordReset",
  passwordResetSchema
);