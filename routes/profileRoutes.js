const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get logged-in user's profile
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Profile error:", error);

    res.status(500).json({
      message: "Server error while fetching profile",
    });
  }
});


// Update logged-in user's profile
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      college,
      course,
      year,
      bio,
      skills,
      interests,
      profileImage,
    } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (name !== undefined) user.name = name;
    if (college !== undefined) user.college = college;
    if (course !== undefined) user.course = course;
    if (year !== undefined) user.year = year;
    if (bio !== undefined) user.bio = bio;
    if (skills !== undefined) user.skills = skills;
    if (interests !== undefined) user.interests = interests;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        course: user.course,
        year: user.year,
        bio: user.bio,
        skills: user.skills,
        interests: user.interests,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);

    res.status(500).json({
      message: "Server error while updating profile",
    });
  }
});

module.exports = router;