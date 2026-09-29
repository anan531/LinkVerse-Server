const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get AI-based student recommendations
router.get("/", authMiddleware, async (req, res) => {
    try {
        // Get the logged-in student
        const currentUser = await User.findById(req.user.userId);

        if (!currentUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Get students from the same college only
        const students = await User.find({
            role: "student",
            college: currentUser.college,
            _id: { $ne: req.user.userId }
        });

        const recommendations = students.map((student) => {

            // Convert skills to lowercase
            const currentSkills = currentUser.skills.map(skill =>
                skill.toLowerCase().trim()
            );

            const studentSkills = student.skills.map(skill =>
                skill.toLowerCase().trim()
            );

            // Convert interests to lowercase
            const currentInterests = currentUser.interests.map(interest =>
                interest.toLowerCase().trim()
            );

            const studentInterests = student.interests.map(interest =>
                interest.toLowerCase().trim()
            );

            // Find matching skills
            const matchingSkills = currentSkills.filter(skill =>
                studentSkills.includes(skill)
            );

            // Find matching interests
            const matchingInterests = currentInterests.filter(interest =>
                studentInterests.includes(interest)
            );

            // Skill score = 40%
            const skillScore =
                currentSkills.length > 0
                    ? (matchingSkills.length / currentSkills.length) * 40
                    : 0;

            // Interest score = 30%
            const interestScore =
                currentInterests.length > 0
                    ? (matchingInterests.length / currentInterests.length) * 30
                    : 0;

            // Same course = 20%
            const courseScore =
                currentUser.course &&
                student.course &&
                currentUser.course.toLowerCase().trim() ===
                student.course.toLowerCase().trim()
                    ? 20
                    : 0;

            // Same academic year = 10%
            const yearScore =
                currentUser.year &&
                student.year &&
                currentUser.year.toLowerCase().trim() ===
                student.year.toLowerCase().trim()
                    ? 10
                    : 0;

            // Final score
            const totalScore =
                skillScore +
                interestScore +
                courseScore +
                yearScore;

            return {
                student: {
                    _id: student._id,
                    name: student.name,
                    college: student.college,
                    course: student.course,
                    year: student.year,
                    bio: student.bio,
                    skills: student.skills,
                    interests: student.interests,
                    profileImage: student.profileImage
                },

                matchScore: Math.round(totalScore),

                matchingSkills,
                matchingInterests,

                sameCourse:
                    courseScore > 0,

                sameYear:
                    yearScore > 0
            };
        });

        // Highest match first
        recommendations.sort(
            (a, b) => b.matchScore - a.matchScore
        );

        res.json({
            message: "AI recommendations generated successfully",
            recommendations
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error generating recommendations"
        });
    }
});

module.exports = router;