const express = require("express");
const router = express.Router();
const CompanyController = require("../Controllers/company.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Auth
router.post("/signup", CompanyController.signup);
router.post("/login", CompanyController.login);

// Read
// Get all companies - protected (requires JWT)
router.get("/", authMiddleware, CompanyController.getAllCompanies);

module.exports = router;
