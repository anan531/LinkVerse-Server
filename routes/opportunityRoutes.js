
const express = require("express");
const Opportunity = require("../models/Opportunity");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Validate opportunity deadline
const isPastDeadline = (deadline) => {
    if (!deadline) {
        return false;
    }

    const today = new Date();
    const todayString =
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    return deadline < todayString;
};

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

        // Reject past deadlines
        if (isPastDeadline(deadline)) {
            return res.status(400).json({
                message: "Application deadline cannot be in the past."
            });
        }

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

// Edit an opportunity - Admin only
router.put("/:opportunityId", authMiddleware, async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "Only admins can edit opportunities"
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

        // Reject past deadlines
        if (isPastDeadline(deadline)) {
            return res.status(400).json({
                message: "Application deadline cannot be in the past."
            });
        }

        const opportunity = await Opportunity.findByIdAndUpdate(
            req.params.opportunityId,
            {
                title,
                type,
                description,
                organization,
                location,
                link,
                deadline
            },
            { new: true, runValidators: true }
        );

        if (!opportunity) {
            return res.status(404).json({
                message: "Opportunity not found"
            });
        }

        res.json({
            message: "Opportunity updated successfully",
            opportunity
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error updating opportunity"
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

