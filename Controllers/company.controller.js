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
      data: result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};
