const express = require("express");
const router = express.Router();
const UserController = require("../Controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { authorize, authorizeSelfOrRoles } = require("../middleware/authorize.middleware");

// Login route (Public)
router.post("/login", UserController.login);

// All other user routes require authentication
router.use(authMiddleware);

// Create - Only Admin & HR
router.post("/", authorize(["Admin", "HR"]), UserController.createUser);

// Read
// Admin, HR, Manager can read all. Employee can read.
router.get("/", authorize(["Admin", "HR", "Manager", "Employee"]), UserController.getUsers);
router.get("/with-company", authorize(["Admin", "HR"]), UserController.getUsersWithCompany);
router.get("/:id", authorize(["Admin", "HR", "Manager", "Employee"]), UserController.getUserById);

// Update
// Only Admin, HR, Manager can update ANY user. Employee can ONLY update THEMSELVES (limited update).
router.put("/:id", authorizeSelfOrRoles(["Admin", "HR", "Manager"]), UserController.updateUser);

// Delete - Only Admin & HR
router.delete("/:id", authorize(["Admin", "HR"]), UserController.deleteUser);

module.exports = router;
