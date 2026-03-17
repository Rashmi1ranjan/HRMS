const db = require("../config/db");

// Create a new user
exports.createUser = async (data) => {
  const sql = `
    INSERT INTO users 
    (company_id, role_id, designation_id, name, email, password, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  return db.execute(sql, [
    data.company_id,
    data.role_id,
    data.designation_id,
    data.name,
    data.email,
    data.password,
    data.status ?? true,
  ]);
};

// Find user by ID with company validation
exports.findById = async (id, company_id) => {
  const sql = `
    SELECT u.*, r.role_name, d.name as designation_name, dept.name as department_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    LEFT JOIN designations d ON u.designation_id = d.id
    LEFT JOIN departments dept ON d.department_id = dept.id
    WHERE u.id = ? AND u.company_id = ? AND u.deleted_at IS NULL
  `;
  return db.execute(sql, [id, company_id]);
};

// Find user by email within company
exports.findByEmail = async (email, company_id) => {
  const sql = `
    SELECT u.*, r.role_name, d.name as designation_name, dept.name as department_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    LEFT JOIN designations d ON u.designation_id = d.id
    LEFT JOIN departments dept ON d.department_id = dept.id
    WHERE u.email = ? AND u.company_id = ? AND u.deleted_at IS NULL
  `;
  return db.execute(sql, [email, company_id]);
};

// Find all users for a company (with pagination)
exports.findByCompanyId = async (company_id, page = 1, limit = 10) => {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const offset = (pageNum - 1) * limitNum;
  const sql = `
    SELECT u.id, u.company_id, u.role_id, u.designation_id, u.name, u.email,
           u.status, u.created_at, u.updated_at, r.role_name, 
           d.name as designation_name, dept.name as department_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    LEFT JOIN designations d ON u.designation_id = d.id
    LEFT JOIN departments dept ON d.department_id = dept.id
    WHERE u.company_id = ? AND u.deleted_at IS NULL
    ORDER BY u.created_at DESC
    LIMIT ${limitNum} OFFSET ${offset}
  `;
  return db.execute(sql, [company_id]);
};

// Count all users for a company
exports.countByCompanyId = async (company_id) => {
  const sql = `SELECT COUNT(*) AS total FROM users WHERE company_id = ? AND deleted_at IS NULL`;
  return db.execute(sql, [company_id]);
};

// Update user
exports.updateUser = async (id, company_id, data) => {
  const sql = `
    UPDATE users 
    SET name = ?, email = ?, role_id = ?, designation_id = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND company_id = ? AND deleted_at IS NULL
  `;

  return db.execute(sql, [
    data.name,
    data.email,
    data.role_id,
    data.designation_id,
    data.status,
    id,
    company_id,
  ]);
};

// Update user password
exports.updatePassword = async (id, company_id, hashedPassword) => {
  const sql = `
    UPDATE users 
    SET password = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND company_id = ? AND deleted_at IS NULL
  `;

  return db.execute(sql, [hashedPassword, id, company_id]);
};

// Search user by ID or Name within company
exports.findByIdOrName = async (search, company_id) => {
  const sql = `
    SELECT u.id, u.name, u.email, u.status,
           r.role_name,
           d.name AS designation_name,
           dept.name AS department_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    LEFT JOIN designations d ON u.designation_id = d.id
    LEFT JOIN departments dept ON d.department_id = dept.id
    WHERE u.company_id = ?
      AND u.deleted_at IS NULL
      AND (u.id = ? OR u.name LIKE ?)
    ORDER BY u.name ASC
  `;
  const namePattern = `%${search}%`;
  const idValue = parseInt(search, 10) || 0;
  return db.execute(sql, [company_id, idValue, namePattern]);
};

// Find all users with their company, role and designation info
exports.findUsersWithCompany = async () => {
  const sql = `
    SELECT 
      u.id              AS user_id,
      u.name            AS user_name,
      u.email           AS user_email,
      u.status          AS user_status,
      c.id              AS company_id,
      c.name            AS company_name,
      c.email           AS company_email,
      c.city            AS company_city,
      r.id              AS role_id,
      r.role_name,
      d.id              AS designation_id,
      d.name            AS designation_name,
      dept.id           AS department_id,
      dept.name         AS department_name
    FROM users u
    LEFT JOIN companies c    ON u.company_id    = c.id
    LEFT JOIN roles r        ON u.role_id       = r.id
    LEFT JOIN designations d ON u.designation_id = d.id
    LEFT JOIN departments dept ON d.department_id = dept.id
    WHERE u.deleted_at IS NULL
    ORDER BY c.name ASC, u.name ASC
  `;
  return db.execute(sql);
};

// Soft delete user
exports.deleteUser = async (id, company_id) => {
  const sql = `
    UPDATE users 
    SET deleted_at = CURRENT_TIMESTAMP
    WHERE id = ? AND company_id = ? AND deleted_at IS NULL
  `;
  return db.execute(sql, [id, company_id]);
};
