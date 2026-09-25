const express = require("express");
const Post = require("../models/Post");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all posts
router.get("/", authMiddleware, async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        res.json(posts);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error fetching posts"
        });
    }
});

// Create a post
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || content.trim() === "") {
            return res.status(400).json({
                message: "Post content is required"
            });
        }

        const post = new Post({
            content,
            createdBy: req.user.userId
        });

        await post.save();

        const populatedPost = await Post.findById(post._id)
            .populate("createdBy", "name email");

        res.status(201).json({
            message: "Post created successfully",
            post: populatedPost
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error creating post"
        });
    }
});


// Like or unlike a post
router.put("/:postId/like", authMiddleware, async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const userId = req.user.userId;

        const alreadyLiked = post.likes.includes(userId);

        if (alreadyLiked) {
            post.likes = post.likes.filter(
                (id) => id.toString() !== userId
            );

            await post.save();

            return res.json({
                message: "Post unliked successfully",
                likes: post.likes.length
            });
        }

        post.likes.push(userId);

        await post.save();

        res.json({
            message: "Post liked successfully",
            likes: post.likes.length
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error liking post"
        });
    }
});

// Delete a post - Admin only
router.delete("/:postId", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied. Admins only."
            });
        }

        const post = await Post.findByIdAndDelete(
            req.params.postId
        );

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        res.json({
            message: "Post deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error deleting post"
        });
    }
});

module.exports = router;