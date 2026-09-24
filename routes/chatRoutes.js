const express = require("express");
const Message = require("../models/Message");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Send a message
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { receiver, message } = req.body;

        const newMessage = new Message({
            sender: req.user.userId,
            receiver,
            message
        });

        await newMessage.save();

        res.status(201).json({
            message: "Message sent successfully",
            data: newMessage
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error sending message"
        });
    }
});

// Get chat between current user and another user
router.get("/:userId", authMiddleware, async (req, res) => {
    try {
        const otherUser = req.params.userId;

        const messages = await Message.find({
            $or: [
                {
                    sender: req.user.userId,
                    receiver: otherUser
                },
                {
                    sender: otherUser,
                    receiver: req.user.userId
                }
            ]
        })
            .populate("sender", "name email")
            .populate("receiver", "name email")
            .sort({ createdAt: 1 });

        res.json(messages);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error fetching messages"
        });
    }
});

module.exports = router;