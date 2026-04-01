const express = require("express");
const router = express.Router();
const DesignationController = require("../Controllers/designation.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/authorize.middleware");

// All routes are protected and require authentication
router.use(authMiddleware);

// Create - Designation -> only read (Blocking for roles, superadmin via company logic should handle setup)
router.post("/", authorize([]), DesignationController.createDesignation);

// Read - Admin, HR, Manager, Employee
router.get("/", authorize(["Admin", "HR", "Manager", "Employee"]), DesignationController.getAllDesignations);

// Update - Designation -> only read
router.put("/:id", authorize([]), DesignationController.updateDesignation);

// Delete - Designation -> only read
router.delete("/:id", authorize([]), DesignationController.deleteDesignation);

module.exports = router;
