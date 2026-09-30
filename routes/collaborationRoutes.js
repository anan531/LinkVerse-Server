const express = require("express");
const Collaboration = require("../models/Collaboration");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// Get all collaborations
router.get("/", authMiddleware, async (req, res) => {
    try {
        const collaborations = await Collaboration.find()
            .populate("createdBy", "name email")
            .populate("members", "name email");

        res.json(collaborations);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error fetching collaborations"
        });
    }
});


// Create a collaboration
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
        console.error(error);

        res.status(500).json({
            message: "Error creating collaboration"
        });
    }
});


// Edit a collaboration
// Only the creator can edit their collaboration
router.put("/:collaborationId", authMiddleware, async (req, res) => {
    try {
        const {
            title,
            description,
            requiredSkills,
            status
        } = req.body;

        const collaboration = await Collaboration.findById(
            req.params.collaborationId
        );

        if (!collaboration) {
            return res.status(404).json({
                message: "Collaboration not found"
            });
        }

        // Check whether the logged-in user is the creator
        if (
            collaboration.createdBy.toString() !==
            req.user.userId
        ) {
            return res.status(403).json({
                message: "Only the creator can edit this collaboration"
            });
        }

        collaboration.title = title;
        collaboration.description = description;
        collaboration.requiredSkills = requiredSkills;

        if (status) {
            collaboration.status = status;
        }

        await collaboration.save();

        res.json({
            message: "Collaboration updated successfully",
            collaboration
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error updating collaboration"
        });
    }
});


module.exports = router;