const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const studentRoutes = require("./routes/studentRoutes");
const connectionRoutes = require("./routes/connectionRoutes");
const opportunityRoutes = require("./routes/opportunityroutes");
const collaborationRoutes = require("./routes/collaborationRoutes");
const collaborationRequestRoutes = require("./routes/collaborationRequestRoutes");
const chatRoutes = require("./routes/chatRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminStudentRoutes = require("./routes/adminStudentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/collaborations", collaborationRoutes);
app.use("/api/collaboration-requests", collaborationRequestRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/students", adminStudentRoutes);


app.get("/", (req, res) => {
    res.send("LinkVerse Backend is Running!");
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully");

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB Connection Failed:", error.message);
    });