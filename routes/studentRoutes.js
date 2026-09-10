const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all students
router.get("/", authMiddleware, async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
      _id: { $ne: req.user.userId },
    }).select("-password");

    res.status(200).json({
      message: "Students fetched successfully",
      students,
    });
  } catch (error) {
    console.error("Students error:", error);

    res.status(500).json({
      message: "Server error while fetching students",
    });
  }
});

module.exports = router;