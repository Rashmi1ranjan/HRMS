const express = require("express");
const router = express.Router();
const RoleController = require("../Controllers/role.controller");
const authMiddleware = require("../middleware/auth.middleware");

// All role routes require authentication
router.use(authMiddleware);

// Create
router.post("/", RoleController.createRole);

// Read
router.get("/", RoleController.getRoles);
router.get("/:id", RoleController.getRoleById);

// Update
router.put("/:id", RoleController.updateRole);

// Delete
router.delete("/:id", RoleController.deleteRole);

module.exports = router;
