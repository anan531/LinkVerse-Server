const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all students
router.get("/", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied. Admins only."
            });
        }

        const students = await User.find(
            { role: "student" },
            "name email college course year"
        );

        res.json({
            message: "Students fetched successfully",
            students
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error fetching students"
        });
    }
});

// Delete a student
router.delete("/:studentId", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied. Admins only."
            });
        }

        const student = await User.findOneAndDelete({
            _id: req.params.studentId,
            role: "student"
        });

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.json({
            message: "Student deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error deleting student"
        });
    }
});

module.exports = router;