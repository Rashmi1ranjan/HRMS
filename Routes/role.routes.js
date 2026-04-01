const express = require("express");
const router = express.Router();
const RoleController = require("../Controllers/role.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/authorize.middleware");

// All role routes require authentication
router.use(authMiddleware);

// Create - Admin, HR
router.post("/", authorize(["Admin", "HR"]), RoleController.createRole);

// Read - Admin, HR, Manager, Employee
router.get("/", authorize(["Admin", "HR", "Manager", "Employee"]), RoleController.getRoles);
router.get("/:id", authorize(["Admin", "HR", "Manager", "Employee"]), RoleController.getRoleById);

// Update - Admin, HR
router.put("/:id", authorize(["Admin", "HR"]), RoleController.updateRole);

// Delete - Admin, HR
router.delete("/:id", authorize(["Admin", "HR"]), RoleController.deleteRole);

module.exports = router;
