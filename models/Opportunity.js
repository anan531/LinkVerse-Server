const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    type: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    organization: {
        type: String,
        required: true
    },

    location: {
        type: String
    },

    link: {
        type: String
    },

    deadline: {
        type: String
    }
});

module.exports = mongoose.model("Opportunity", opportunitySchema);