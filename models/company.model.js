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

// Find all companies with pagination (excludes password)
exports.findAll = async (page = 1, limit = 10) => {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const offset = (pageNum - 1) * limitNum;
  const sql = `
    SELECT id, name, alias, address, email, city, pincode, is_active, created_at, updated_at
    FROM companies
    WHERE deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT ${limitNum} OFFSET ${offset}
  `;
  return db.query(sql);
};

// Count all active companies
exports.countAll = async () => {
  const sql = `SELECT COUNT(*) AS total FROM companies WHERE deleted_at IS NULL`;
  return db.query(sql);
};
