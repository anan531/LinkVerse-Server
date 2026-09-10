const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },

    college: {
      type: String,
      default: "",
    },

    course: {
      type: String,
      default: "",
    },

    year: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    interests: {
      type: [String],
      default: [],
    },

    profileImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);