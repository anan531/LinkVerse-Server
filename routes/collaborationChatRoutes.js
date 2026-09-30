const express = require("express");
const CollaborationMessage = require("../models/CollaborationMessage");
const Collaboration = require("../models/Collaboration");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Check whether user is allowed to access the collaboration chat
const checkMembership = async (collaborationId, userId) => {
    const collaboration = await Collaboration.findById(collaborationId);

    if (!collaboration) {
        return null;
    }

    const isCreator =
        collaboration.createdBy.toString() === userId;

    const isMember = collaboration.members.some(
        (member) => member.toString() === userId
    );

    return {
        collaboration,
        allowed: isCreator || isMember
    };
};


// Send group message
router.post(
    "/:collaborationId",
    authMiddleware,
    async (req, res) => {
        try {
            const { collaborationId } = req.params;
            const { message } = req.body;

            if (!message || message.trim() === "") {
                return res.status(400).json({
                    message: "Message cannot be empty"
                });
            }

            const result = await checkMembership(
                collaborationId,
                req.user.userId
            );

            if (!result) {
                return res.status(404).json({
                    message: "Collaboration not found"
                });
            }

            if (!result.allowed) {
                return res.status(403).json({
                    message:
                        "Only collaboration members can access this group chat"
                });
            }

            const newMessage = new CollaborationMessage({
                collaboration: collaborationId,
                sender: req.user.userId,
                message: message.trim()
            });

            await newMessage.save();

            await newMessage.populate(
                "sender",
                "name email"
            );

            res.status(201).json({
                message: "Group message sent successfully",
                data: newMessage
            });

        } catch (error) {
            console.error(
                "Group chat send error:",
                error
            );

            res.status(500).json({
                message: "Error sending group message"
            });
        }
    }
);


// Get group chat messages
router.get(
    "/:collaborationId",
    authMiddleware,
    async (req, res) => {
        try {
            const { collaborationId } = req.params;

            const result = await checkMembership(
                collaborationId,
                req.user.userId
            );

            if (!result) {
                return res.status(404).json({
                    message: "Collaboration not found"
                });
            }

            if (!result.allowed) {
                return res.status(403).json({
                    message:
                        "Only collaboration members can access this group chat"
                });
            }

            const messages =
                await CollaborationMessage.find({
                    collaboration: collaborationId
                })
                    .populate(
                        "sender",
                        "name email"
                    )
                    .sort({
                        createdAt: 1
                    });

            res.json(messages);

        } catch (error) {
            console.error(
                "Group chat fetch error:",
                error
            );

            res.status(500).json({
                message: "Error fetching group messages"
            });
        }
    }
);

module.exports = router;