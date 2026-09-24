const mongoose = require("mongoose");

const collaborationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    requiredSkills: {
        type: [String],
        default: []
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    members: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
],

    status: {
        type: String,
        enum: ["open", "closed"],
        default: "open"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Collaboration", collaborationSchema);