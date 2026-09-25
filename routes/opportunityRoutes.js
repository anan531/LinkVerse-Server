const express = require("express");
const Opportunity = require("../models/Opportunity");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all opportunities
router.get("/", async (req, res) => {
    try {
        const opportunities = await Opportunity.find();

        res.json(opportunities);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching opportunities"
        });
    }
});

// Create an opportunity
router.post("/", authMiddleware, async (req, res) => {    
    
    if (req.user.role !== "admin") {
    return res.status(403).json({
        message: "Only admins can create opportunities"
    });
}
    
    try {
        const {
            title,
            type,
            description,
            organization,
            location,
            link,
            deadline
        } = req.body;

        const opportunity = new Opportunity({
            title,
            type,
            description,
            organization,
            location,
            link,
            deadline
        });

        await opportunity.save();

        res.status(201).json({
            message: "Opportunity created successfully",
            opportunity
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating opportunity"
        });
    }
});

// Delete an opportunity - Admin only
router.delete("/:opportunityId", authMiddleware, async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "Only admins can delete opportunities"
        });
    }

    try {
        const opportunity = await Opportunity.findByIdAndDelete(
            req.params.opportunityId
        );

        if (!opportunity) {
            return res.status(404).json({
                message: "Opportunity not found"
            });
        }

        res.json({
            message: "Opportunity deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error deleting opportunity"
        });
    }
});

module.exports = router;