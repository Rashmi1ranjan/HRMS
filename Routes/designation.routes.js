const express = require("express");
const router = express.Router();
const DesignationController = require("../Controllers/designation.controller");
const authMiddleware = require("../middleware/auth.middleware");

// All routes are protected and require company authentication
router.use(authMiddleware);

// Create
router.post("/", DesignationController.createDesignation);

// Read
router.get("/", DesignationController.getAllDesignations);

// Update
router.put("/:id", DesignationController.updateDesignation);

// Delete
router.delete("/:id", DesignationController.deleteDesignation);

module.exports = router;
