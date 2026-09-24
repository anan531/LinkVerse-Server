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

        if (collaboration.createdBy.toString() === req.user.userId) {
            return res.status(400).json({
                message: "You cannot request to join your own collaboration"
            });
        }

        const existingRequest = await CollaborationRequest.findOne({
            collaboration: collaborationId,
            sender: req.user.userId
        });

        if (existingRequest && existingRequest.status !== "rejected") {
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


// Get pending join requests for my collaborations
router.get("/my-requests", authMiddleware, async (req, res) => {
    try {
        const collaborations = await Collaboration.find({
            createdBy: req.user.userId
        });

        const collaborationIds = collaborations.map(
            (collaboration) => collaboration._id
        );

        const requests = await CollaborationRequest.find({
            collaboration: { $in: collaborationIds },
            status: "pending"
        })
            .populate("sender", "name email")
            .populate("collaboration", "title");

        res.json(requests);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error fetching join requests"
        });
    }
});


// Accept a collaboration join request
router.put("/:requestId/accept", authMiddleware, async (req, res) => {
    try {
        const { requestId } = req.params;

        const request = await CollaborationRequest.findById(requestId)
            .populate("collaboration");

        if (!request) {
            return res.status(404).json({
                message: "Join request not found"
            });
        }

        // Only the collaboration creator can accept
        if (
            request.collaboration.createdBy.toString() !==
            req.user.userId
        ) {
            return res.status(403).json({
                message: "You are not allowed to accept this request"
            });
        }

        request.status = "accepted";

        await request.save();

        // Add the student to the collaboration team
        await Collaboration.findByIdAndUpdate(
            request.collaboration._id,
            {
                $addToSet: {
                    members: request.sender
                }
            }
        );

        res.json({
            message: "Join request accepted successfully",
            request
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error accepting join request"
        });
    }
});


// Reject a collaboration join request
router.put("/:requestId/reject", authMiddleware, async (req, res) => {
    try {
        const { requestId } = req.params;

        const request = await CollaborationRequest.findById(requestId)
            .populate("collaboration");

        if (!request) {
            return res.status(404).json({
                message: "Join request not found"
            });
        }

        // Only the collaboration creator can reject
        if (
            request.collaboration.createdBy.toString() !==
            req.user.userId
        ) {
            return res.status(403).json({
                message: "You are not allowed to reject this request"
            });
        }

        request.status = "rejected";

        await request.save();

        res.json({
            message: "Join request rejected successfully",
            request
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error rejecting join request"
        });
    }
});


module.exports = router;