const express = require("express");
const Collaboration = require("../models/Collaboration");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all collaboration posts
router.get("/", authMiddleware, async (req, res) => {
    try {
        const collaborations = await Collaboration.find()
            .populate("createdBy", "name email");

        res.json(collaborations);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching collaborations"
        });
    }
});

// Create a collaboration post
router.post("/", authMiddleware, async (req, res) => {
    try {
        const {
            title,
            description,
            requiredSkills
        } = req.body;

        const collaboration = new Collaboration({
            title,
            description,
            requiredSkills,
            createdBy: req.user.userId
        });

        await collaboration.save();

        res.status(201).json({
            message: "Collaboration created successfully",
            collaboration
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating collaboration"
        });
    }
});

module.exports = router;