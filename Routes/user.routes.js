const express = require("express");
const router = express.Router();
const UserController = require("../Controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");

// All user routes require authentication
router.use(authMiddleware);

// Create user
router.post("/", UserController.createUser);

// Get all users
router.get("/", UserController.getUsers);

// Get user by ID
router.get("/:id", UserController.getUserById);

// Update user
router.put("/:id", UserController.updateUser);

// Delete user
router.delete("/:id", UserController.deleteUser);

module.exports = router;
