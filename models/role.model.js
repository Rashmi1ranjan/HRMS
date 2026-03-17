const db = require("../config/db");

// Create a new role
exports.createRole = async (data) => {
    const sql = `
    INSERT INTO roles 
    (role_name, company_id, status)
    VALUES (?, ?, ?)
  `;

    return db.execute(sql, [
        data.role_name,
        data.company_id,
        data.status ?? true,
    ]);
};

// Find role by ID with company validation
exports.findById = async (id, company_id) => {
    const sql = `
    SELECT * FROM roles 
    WHERE id = ? AND company_id = ? AND deleted_at IS NULL
  `;
    return db.execute(sql, [id, company_id]);
};

// Find all roles for a company (with pagination)
exports.findByCompanyId = async (company_id, page = 1, limit = 10) => {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    const sql = `
    SELECT * FROM roles 
    WHERE company_id = ? AND deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT ${limitNum} OFFSET ${offset}
  `;
    return db.execute(sql, [company_id]);
};

// Count all roles for a company
exports.countByCompanyId = async (company_id) => {
    const sql = `SELECT COUNT(*) AS total FROM roles WHERE company_id = ? AND deleted_at IS NULL`;
    return db.execute(sql, [company_id]);
};

// Check if role name exists for company
exports.findByRoleName = async (role_name, company_id) => {
    const sql = `
    SELECT * FROM roles 
    WHERE role_name = ? AND company_id = ? AND deleted_at IS NULL
  `;
    return db.execute(sql, [role_name, company_id]);
};

// Update role
exports.updateRole = async (id, company_id, data) => {
    const sql = `
    UPDATE roles 
    SET role_name = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND company_id = ? AND deleted_at IS NULL
  `;

    return db.execute(sql, [data.role_name, data.status, id, company_id]);
};

// Soft delete role
exports.deleteRole = async (id, company_id) => {
    const sql = `
    UPDATE roles 
    SET deleted_at = CURRENT_TIMESTAMP
    WHERE id = ? AND company_id = ? AND deleted_at IS NULL
  `;
    return db.execute(sql, [id, company_id]);
};
