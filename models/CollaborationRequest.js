const mongoose = require("mongoose");

const collaborationRequestSchema = new mongoose.Schema({
    collaboration: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Collaboration",
        required: true
    },

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model(
    "CollaborationRequest",
    collaborationRequestSchema
);