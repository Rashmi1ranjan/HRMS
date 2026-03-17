const express = require("express");
const router = express.Router();
const UserController = require("../Controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");

// All user routes require authentication
router.use(authMiddleware);

// Create
router.post("/", UserController.createUser);

// Read
router.get("/", UserController.getUsers);
router.get("/with-company", UserController.getUsersWithCompany);
// router.get("/search", UserController.searchUser);
router.get("/:id", UserController.getUserById);

// Update
router.put("/:id", UserController.updateUser);

// Delete
router.delete("/:id", UserController.deleteUser);

module.exports = router;
