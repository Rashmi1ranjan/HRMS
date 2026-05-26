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

// Find all roles for a company
exports.findByCompanyId = async (company_id) => {
    const sql = `
    SELECT * FROM roles 
    WHERE company_id = ? AND deleted_at IS NULL
    ORDER BY created_at DESC
  `;
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
