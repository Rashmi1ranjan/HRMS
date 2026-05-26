const db = require("../config/db");

// Create a new user
exports.createUser = async (data) => {
    const sql = `
    INSERT INTO users 
    (company_id, role_id, name, email, password, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

    return db.execute(sql, [
        data.company_id,
        data.role_id,
        data.name,
        data.email,
        data.password,
        data.status ?? true,
    ]);
};

// Find user by ID with company validation
exports.findById = async (id, company_id) => {
    const sql = `
    SELECT u.*, r.role_name 
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.id = ? AND u.company_id = ? AND u.deleted_at IS NULL
  `;
    return db.execute(sql, [id, company_id]);
};

// Find user by email within company
exports.findByEmail = async (email, company_id) => {
    const sql = `
    SELECT u.*, r.role_name 
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.email = ? AND u.company_id = ? AND u.deleted_at IS NULL
  `;
    return db.execute(sql, [email, company_id]);
};

// Find all users for a company
exports.findByCompanyId = async (company_id) => {
    const sql = `
    SELECT u.*, r.role_name 
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.company_id = ? AND u.deleted_at IS NULL
    ORDER BY u.created_at DESC
  `;
    return db.execute(sql, [company_id]);
};

// Update user
exports.updateUser = async (id, company_id, data) => {
    const sql = `
    UPDATE users 
    SET name = ?, email = ?, role_id = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND company_id = ? AND deleted_at IS NULL
  `;

    return db.execute(sql, [
        data.name,
        data.email,
        data.role_id,
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

// Soft delete user
exports.deleteUser = async (id, company_id) => {
    const sql = `
    UPDATE users 
    SET deleted_at = CURRENT_TIMESTAMP
    WHERE id = ? AND company_id = ? AND deleted_at IS NULL
  `;
    return db.execute(sql, [id, company_id]);
};
