const express = require("express");
const CollaborationRequest = require("../models/CollaborationRequest");
const Collaboration = require("../models/Collaboration");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Send a request to join a collaboration
router.post("/:collaborationId", authMiddleware, async (req, res) => {
    try {
        const { collaborationId } = req.params;

        const collaboration = await Collaboration.findById(collaborationId);

        if (!collaboration) {
            return res.status(404).json({
                message: "Collaboration not found"
            });
        }

        // Prevent creator from requesting to join their own collaboration
        if (collaboration.createdBy.toString() === req.user.userId) {
            return res.status(400).json({
                message: "You cannot request to join your own collaboration"
            });
        }

        // Check if request already exists
        const existingRequest = await CollaborationRequest.findOne({
            collaboration: collaborationId,
            sender: req.user.userId
        });

        if (existingRequest) {
            return res.status(400).json({
                message: "You have already requested to join"
            });
        }

        const request = new CollaborationRequest({
            collaboration: collaborationId,
            sender: req.user.userId
        });

        await request.save();

        res.status(201).json({
            message: "Join request sent successfully",
            request
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error sending join request"
        });
    }
});

module.exports = router;