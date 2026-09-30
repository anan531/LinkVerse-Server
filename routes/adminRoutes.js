const express = require("express");
const User = require("../models/User");
const Post = require("../models/Post");
const Opportunity = require("../models/Opportunity");
const Collaboration = require("../models/Collaboration");
const Connection = require("../models/Connection");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Admin dashboard statistics
router.get("/dashboard", authMiddleware, async (req, res) => {
    try {
        // Admin protection
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied. Admins only."
            });
        }

        // Basic platform statistics
        const totalStudents = await User.countDocuments({
            role: "student"
        });

        const totalPosts = await Post.countDocuments();

        const totalOpportunities =
            await Opportunity.countDocuments();

        const totalCollaborations =
            await Collaboration.countDocuments();

        // Student activity statistics
        const totalConnections =
            await Connection.countDocuments({
                status: "accepted"
            });

        // Count students who are members of collaborations
        const collaborationData =
            await Collaboration.find({}, "members createdBy");

        const participantIds = new Set();

        collaborationData.forEach((collaboration) => {
            // Add creator
            if (collaboration.createdBy) {
                participantIds.add(
                    collaboration.createdBy.toString()
                );
            }

            // Add members
            collaboration.members.forEach((member) => {
                participantIds.add(member.toString());
            });
        });

        const collaborationParticipants =
            participantIds.size;

        // Opportunity statistics by type
        const opportunityTypeData =
            await Opportunity.aggregate([
                {
                    $group: {
                        _id: "$type",
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        count: -1
                    }
                }
            ]);

        const opportunitiesByType =
            opportunityTypeData.map((item) => ({
                type: item._id,
                count: item.count
            }));

        // Platform monitoring
        const totalRegisteredUsers =
            await User.countDocuments();

        const totalPendingConnections =
            await Connection.countDocuments({
                status: "pending"
            });

        res.json({
            // Basic statistics
            totalStudents,
            totalPosts,
            totalOpportunities,
            totalCollaborations,

            // Student activity
            totalConnections,
            collaborationParticipants,

            // Opportunity statistics
            opportunitiesByType,

            // Admin monitoring
            totalRegisteredUsers,
            totalPendingConnections
        });

    } catch (error) {
        console.error(
            "Admin dashboard error:",
            error
        );

        res.status(500).json({
            message:
                "Error fetching dashboard statistics"
        });
    }
});

module.exports = router;