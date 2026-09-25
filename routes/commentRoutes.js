const express = require("express");
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get comments for a post
router.get("/:postId", authMiddleware, async (req, res) => {
    try {
        const comments = await Comment.find({
            post: req.params.postId
        })
            .populate("createdBy", "name email")
            .sort({ createdAt: 1 });

        res.json(comments);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error fetching comments"
        });
    }
});

// Add a comment
router.post("/:postId", authMiddleware, async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || content.trim() === "") {
            return res.status(400).json({
                message: "Comment content is required"
            });
        }

        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const comment = new Comment({
            post: req.params.postId,
            createdBy: req.user.userId,
            content
        });

        await comment.save();

        const populatedComment = await Comment.findById(comment._id)
            .populate("createdBy", "name email");

        res.status(201).json({
            message: "Comment added successfully",
            comment: populatedComment
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error adding comment"
        });
    }
});

module.exports = router;