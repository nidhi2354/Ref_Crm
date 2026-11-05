const express = require("express");
const router = express.Router();

const {
  createUser,
  loginUser,
  getMe,
  getAllUsers,
  getSalesUserById,
  updateUserStatus,
  updateUser,
} = require("../controllers/userController");

const {
  protect,
  adminOnly,
} = require("../middlewares/auth");

// Login
router.post("/login", loginUser);

// Logged-in user profile
router.get("/me", protect, getMe);

// Get all Sales users - Admin only
router.get("/", protect, adminOnly, getAllUsers);

// Get single Sales user - Admin only
router.get("/:id", protect, adminOnly, getSalesUserById);

// Update Sales user status - Admin only
router.patch("/:id/status", protect, adminOnly, updateUserStatus);

// Update Sales user details - Admin only
router.patch("/:id", protect, adminOnly, updateUser);


// Create Sales user - Admin only
router.post("/", protect, adminOnly, createUser);

module.exports = router;