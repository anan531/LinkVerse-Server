const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const PasswordReset = require("../models/PasswordReset");

const router = express.Router();

// =========================================
// EMAIL CONFIGURATION
// =========================================

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// =========================================
// REGISTER
// =========================================

router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      college,
      department,
      course,
      year,
    } = req.body;

    // REQUIRED FIELD VALIDATION

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Please enter your full name",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: "Please enter your email address",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "Please enter a password",
      });
    }

    if (!college || !college.trim()) {
      return res.status(400).json({
        message: "Please enter your college",
      });
    }

    if (!department || !department.trim()) {
      return res.status(400).json({
        message: "Please enter your department",
      });
    }

    if (!course || !course.trim()) {
      return res.status(400).json({
        message: "Please enter your course",
      });
    }

    if (!year || !year.trim()) {
      return res.status(400).json({
        message: "Please enter your current year of study",
      });
    }

    // NAME VALIDATION

    const cleanName = name.trim();

    if (cleanName.length < 2) {
      return res.status(400).json({
        message: "Name must contain at least 2 characters",
      });
    }

    // EMAIL VALIDATION

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail.includes("@")) {
      return res.status(400).json({
        message: "Your email is missing the @ symbol",
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    // PASSWORD VALIDATION

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // COLLEGE VALIDATION

    const cleanCollege = college.trim();

    if (cleanCollege.length < 2) {
      return res.status(400).json({
        message: "Please enter a valid college name",
      });
    }

    // DEPARTMENT VALIDATION

    const cleanDepartment = department.trim();

    if (cleanDepartment.length < 2) {
      return res.status(400).json({
        message: "Please enter a valid department",
      });
    }

    // COURSE VALIDATION

    const cleanCourse = course.trim();

    if (cleanCourse.length < 2) {
      return res.status(400).json({
        message: "Please enter a valid course",
      });
    }

    // YEAR VALIDATION

    const cleanYear = year.trim();

    const validYears = [
      "I",
      "II",
      "III",
      "IV",
      "1",
      "2",
      "3",
      "4",
      "1st",
      "2nd",
      "3rd",
      "4th",
      "1st Year",
      "2nd Year",
      "3rd Year",
      "4th Year",
    ];

    if (!validYears.includes(cleanYear)) {
      return res.status(400).json({
        message:
          "Please enter a valid year of study such as I, II, III or IV",
      });
    }

    // CHECK EXISTING USER

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    // HASH PASSWORD

    const hashedPassword = await bcrypt.hash(password, 10);

    // CREATE USER

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      college: cleanCollege,
      department: cleanDepartment,
      course: cleanCourse,
      year: cleanYear,
    });

    // SUCCESS RESPONSE

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Server error during registration",
    });
  }
});

// =========================================
// LOGIN
// =========================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // REQUIRED FIELD VALIDATION

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: "Please enter your email address",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "Please enter your password",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // FIND USER

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // CHECK PASSWORD

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // CREATE JWT

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // SUCCESS RESPONSE

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Server error during login",
    });
  }
});

// =========================================
// FORGOT PASSWORD - SEND OTP
// =========================================

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    // Do not reveal whether an account exists

    if (!user) {
      return res.status(200).json({
        message:
          "If an account exists with this email, an OTP has been sent.",
      });
    }

    // Delete previous reset requests

    await PasswordReset.deleteMany({
      userId: user._id,
    });

    // Generate 6-digit OTP

    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    // Hash OTP before storing

    const hashedOTP = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    // OTP expires after 5 minutes

    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

    // Save reset request

    await PasswordReset.create({
      userId: user._id,
      otp: hashedOTP,
      expiresAt,
      attempts: 0,
      verified: false,
    });

    // Send OTP email

    await transporter.sendMail({
      from: `"LinkVerse" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "LinkVerse Password Reset OTP",
      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 30px;
          background: #f8fbfe;
          border-radius: 12px;
        ">
          <h2 style="color: #042558;">
            LinkVerse Password Reset
          </h2>

          <p style="color: #15283d;">
            Hello ${user.name},
          </p>

          <p style="color: #64778c;">
            Use the following OTP to reset your LinkVerse password:
          </p>

          <div style="
            margin: 25px 0;
            padding: 18px;
            text-align: center;
            background: #e5f3fc;
            border-radius: 10px;
          ">
            <span style="
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              color: #042558;
            ">
              ${otp}
            </span>
          </div>

          <p style="color: #64778c;">
            This OTP will expire in 5 minutes.
          </p>

          <p style="color: #64778c;">
            If you did not request a password reset,
            you can safely ignore this email.
          </p>

          <p style="color: #042558;">
            <strong>LinkVerse Team</strong>
          </p>
        </div>
      `,
    });

    res.status(200).json({
      message:
        "If an account exists with this email, an OTP has been sent.",
    });
  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to process password reset request",
    });
  }
});

// =========================================
// VERIFY OTP
// =========================================

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    const resetRequest = await PasswordReset.findOne({
      userId: user._id,
      verified: false,
    });

    if (!resetRequest) {
      return res.status(400).json({
        message:
          "No active password reset request found",
      });
    }

    // Check OTP expiry

    if (new Date() > resetRequest.expiresAt) {
      await PasswordReset.deleteOne({
        _id: resetRequest._id,
      });

      return res.status(400).json({
        message:
          "OTP has expired. Please request a new OTP.",
      });
    }

    // Maximum 5 attempts

    if (resetRequest.attempts >= 5) {
      await PasswordReset.deleteOne({
        _id: resetRequest._id,
      });

      return res.status(400).json({
        message:
          "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    // Hash entered OTP

    const hashedOTP = crypto
      .createHash("sha256")
      .update(otp.toString())
      .digest("hex");

    // Compare OTP

    if (hashedOTP !== resetRequest.otp) {
      resetRequest.attempts += 1;

      await resetRequest.save();

      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // OTP verified

    resetRequest.verified = true;

    await resetRequest.save();

    res.status(200).json({
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error(
      "OTP verification error:",
      error
    );

    res.status(500).json({
      message: "Error verifying OTP",
    });
  }
});

// =========================================
// RESET PASSWORD
// =========================================

router.put("/reset-password", async (req, res) => {
  try {
    const {
      email,
      newPassword,
    } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        message:
          "Email and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(400).json({
        message: "Unable to reset password",
      });
    }

    // Find verified reset request

    const resetRequest = await PasswordReset.findOne({
      userId: user._id,
      verified: true,
    });

    if (!resetRequest) {
      return res.status(403).json({
        message:
          "Please verify the OTP before resetting your password",
      });
    }

    // Check verification expiry

    if (new Date() > resetRequest.expiresAt) {
      await PasswordReset.deleteOne({
        _id: resetRequest._id,
      });

      return res.status(400).json({
        message:
          "Password reset session has expired. Please request a new OTP.",
      });
    }

    // Hash new password

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    user.password = hashedPassword;

    await user.save();

    // Delete reset request

    await PasswordReset.deleteOne({
      _id: resetRequest._id,
    });

    res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while resetting password",
    });
  }
});

module.exports = router;