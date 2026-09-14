const express = require("express");
const Connection = require("../models/Connection");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Send connection request
router.post("/:userId", authMiddleware, async (req, res) => {
  try {
    const senderId = req.user.userId;
    const receiverId = req.params.userId;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    // Prevent connecting with yourself
    if (senderId === receiverId) {
      return res.status(400).json({
        message: "You cannot connect with yourself",
      });
    }

// Check if a connection already exists in either direction
const existingConnection = await Connection.findOne({
  $or: [
    {
      sender: senderId,
      receiver: receiverId,
    },
    {
      sender: receiverId,
      receiver: senderId,
    },
  ],
});

if (existingConnection) {
  return res.status(400).json({
    message: "Connection already exists or request is already sent",
  });
}

    // Create connection request
    const connection = await Connection.create({
      sender: senderId,
      receiver: receiverId,
    });

    res.status(201).json({
      message: "Connection request sent",
      connection,
    });
  } catch (error) {
    console.error("Connection error:", error);

    res.status(500).json({
      message: "Server error while sending connection request",
    });
  }
});
// Get pending connection requests
router.get("/requests", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const requests = await Connection.find({
      receiver: userId,
      status: "pending",
    }).populate("sender", "name email");

    res.status(200).json({
      requests,
    });
  } catch (error) {
    console.error("Get requests error:", error);

    res.status(500).json({
      message: "Server error while fetching connection requests",
    });
  }
});

// Get accepted connections
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const connections = await Connection.find({
      $or: [
        { sender: userId, status: "accepted" },
        { receiver: userId, status: "accepted" },
      ],
    })
      .populate("sender", "name email")
      .populate("receiver", "name email");

    res.status(200).json({
      connections,
    });
  } catch (error) {
    console.error("Get connections error:", error);

    res.status(500).json({
      message: "Server error while fetching connections",
    });
  }
});

// Accept connection request
router.put("/:connectionId/accept", authMiddleware, async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.connectionId);

    if (!connection) {
      return res.status(404).json({
        message: "Connection request not found",
      });
    }

    // Only the receiver can accept
    if (connection.receiver.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not allowed to accept this request",
      });
    }

    connection.status = "accepted";

    await connection.save();

    res.status(200).json({
      message: "Connection request accepted",
      connection,
    });
  } catch (error) {
    console.error("Accept connection error:", error);

    res.status(500).json({
      message: "Server error while accepting request",
    });
  }
});


// Reject connection request
router.put("/:connectionId/reject", authMiddleware, async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.connectionId);

    if (!connection) {
      return res.status(404).json({
        message: "Connection request not found",
      });
    }

    // Only the receiver can reject
    if (connection.receiver.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not allowed to reject this request",
      });
    }

    connection.status = "rejected";

    await connection.save();

    res.status(200).json({
      message: "Connection request rejected",
      connection,
    });
  } catch (error) {
    console.error("Reject connection error:", error);

    res.status(500).json({
      message: "Server error while rejecting request",
    });
  }
});

module.exports = router;