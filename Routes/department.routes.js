const express = require("express");
const router = express.Router();
const DepartmentController = require("../Controllers/department.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/authorize.middleware");

// All routes are protected and require authentication
router.use(authMiddleware);

// Create - Admin, HR
router.post("/", authorize(["Admin", "HR"]), DepartmentController.createDepartment);

// Read - Admin, HR, Manager, Employee
router.get("/", authorize(["Admin", "HR", "Manager", "Employee"]), DepartmentController.getAllDepartments);

// Update - Manager, Admin, HR (Manager can update)
router.put("/:id", authorize(["Admin", "HR", "Manager"]), DepartmentController.updateDepartment);

// Delete - Admin, HR
router.delete("/:id", authorize(["Admin", "HR"]), DepartmentController.deleteDepartment);

module.exports = router;
