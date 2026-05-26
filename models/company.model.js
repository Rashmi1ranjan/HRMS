const db = require("../config/db");

exports.createCompany = async (data) => {
  const sql = `
    INSERT INTO companies 
    (name, alias, address, email, password, city, pincode, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  return db.execute(sql, [
    data.name,
    data.alias,
    data.address,
    data.email,
    data.password,
    data.city,
    data.pincode,
    data.is_active ?? true,
  ]);
};

exports.findByEmail = async (email) => {
  const sql = `
    SELECT * FROM companies 
    WHERE email = ? AND deleted_at IS NULL
  `;
  return db.execute(sql, [email]);
};

exports.findById = async (id) => {
  const sql = `
    SELECT * FROM companies 
    WHERE id = ? AND deleted_at IS NULL
  `;
  return db.execute(sql, [id]);
};
