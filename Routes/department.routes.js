const express = require("express");
const router = express.Router();
const DepartmentController = require("../Controllers/department.controller");
const authMiddleware = require("../middleware/auth.middleware");

// All routes are protected and require company authentication
router.use(authMiddleware);

// Create
router.post("/", DepartmentController.createDepartment);

// Read
router.get("/", DepartmentController.getAllDepartments);

// Update
router.put("/:id", DepartmentController.updateDepartment);

// Delete
router.delete("/:id", DepartmentController.deleteDepartment);

module.exports = router;
