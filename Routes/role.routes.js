const express = require("express");
const router = express.Router();
const RoleController = require("../Controllers/role.controller");
const authMiddleware = require("../middleware/auth.middleware");

// All role routes require authentication
router.use(authMiddleware);

// Create role
router.post("/", RoleController.createRole);

// Get all roles
router.get("/", RoleController.getRoles);

// Get role by ID
router.get("/:id", RoleController.getRoleById);

// Update role
router.put("/:id", RoleController.updateRole);

// Delete role
router.delete("/:id", RoleController.deleteRole);

module.exports = router;
