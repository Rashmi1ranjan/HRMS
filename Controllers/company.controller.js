const CompanyService = require("../Service/company.service");

exports.signup = async (req, res) => {
  try {
    const companyData = {
      name: req.body.name,
      alias: req.body.alias,
      address: req.body.address,
      email: req.body.email,
      password: req.body.password,
      city: req.body.city,
      pincode: req.body.pincode,
      is_active: req.body.is_active,
    };

    const result = await CompanyService.signup(companyData);

    res.status(201).json({
      success: true,
      message: "Company signed up successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const result = await CompanyService.login(req.body);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all companies (paginated)
exports.getAllCompanies = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await CompanyService.getAllCompanies(page, limit);

    res.status(200).json({
      success: true,
      message: "Companies fetched successfully",
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

