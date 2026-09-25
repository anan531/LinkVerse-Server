const express = require("express");
const User = require("../models/User");
const Post = require("../models/Post");
const Opportunity = require("../models/Opportunity");
const Collaboration = require("../models/Collaboration");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Admin dashboard statistics
router.get("/dashboard", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied. Admins only."
            });
        }

        const totalStudents = await User.countDocuments({
            role: "student"
        });

        const totalPosts = await Post.countDocuments();

        const totalOpportunities =
            await Opportunity.countDocuments();

        const totalCollaborations =
            await Collaboration.countDocuments();

        res.json({
            totalStudents,
            totalPosts,
            totalOpportunities,
            totalCollaborations
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error fetching dashboard statistics"
        });
    }
});

module.exports = router;