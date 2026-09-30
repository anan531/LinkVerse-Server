const mongoose = require("mongoose");

const collaborationMessageSchema = new mongoose.Schema({
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

    message: {
        type: String,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model(
    "CollaborationMessage",
    collaborationMessageSchema
);