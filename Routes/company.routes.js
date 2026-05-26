const express = require("express");
const router = express.Router();
const CompanyController = require("../Controllers/company.controller");

router.post("/signup", CompanyController.signup);
router.post("/login", CompanyController.login);

module.exports = router;
