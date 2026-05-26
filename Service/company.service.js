const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Company = require("../models/company.model");
const Role = require("../models/role.model");

exports.signup = async (data) => {
  const { email, password } = data;

  const [existing] = await Company.findByEmail(email);
  if (existing.length > 0) {
    throw new Error("Email already exists");
  }

  data.password = await bcrypt.hash(password, 10);

  const [result] = await Company.createCompany(data);
  const company_id = result.insertId;

  // Auto-create superadmin role for the company
  await Role.createRole({
    role_name: "superadmin",
    company_id: company_id,
    status: true,
  });

  return {
    message: "Company registered successfully",
    company_id: company_id,
  };
};

exports.login = async (data) => {
  const { email, password } = data;

  const [rows] = await Company.findByEmail(email);
  if (rows.length === 0) {
    throw new Error("Invalid email or password");
  }

  const company = rows[0];

  const isMatch = await bcrypt.compare(password, company.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  // Get the superadmin role for this company
  const [roleRows] = await Role.findByRoleName("superadmin", company.id);
  const role = roleRows.length > 0 ? roleRows[0] : null;

  const token = jwt.sign(
    {
      id: company.id,
      email: company.email,
      role: role ? role.role_name : null,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return {
    id: company.id,
    name: company.name,
    alias: company.alias,
    email: company.email,
    city: company.city,
    pincode: company.pincode,
    is_active: company.is_active,
    role: role ? role.role_name : null,
    token,
  };
};
