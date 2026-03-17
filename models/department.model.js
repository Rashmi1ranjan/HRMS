const db = require("../config/db");

// Create a new department
exports.createDepartment = async (data) => {
    const sql = `
    INSERT INTO departments 
    (name, company_id)
    VALUES (?, ?)
  `;

    return db.execute(sql, [data.name, data.company_id]);
};

// Find department by ID with company validation
exports.findById = async (id, company_id) => {
    const sql = `
    SELECT * FROM departments 
    WHERE id = ? AND company_id = ? AND deleted_at IS NULL
  `;
    return db.execute(sql, [id, company_id]);
};

// Find all departments for a company (with pagination)
exports.findByCompanyId = async (company_id, page = 1, limit = 10) => {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;
    
    const sql = `
    SELECT * FROM departments 
    WHERE company_id = ? AND deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT ${limitNum} OFFSET ${offset}
  `;
    return db.execute(sql, [company_id]);
};

// Count all departments for a company
exports.countByCompanyId = async (company_id) => {
    const sql = `SELECT COUNT(*) AS total FROM departments WHERE company_id = ? AND deleted_at IS NULL`;
    return db.execute(sql, [company_id]);
};

// Check if department name exists for company
exports.findByName = async (name, company_id) => {
    const sql = `
    SELECT * FROM departments 
    WHERE name = ? AND company_id = ? AND deleted_at IS NULL
  `;
    return db.execute(sql, [name, company_id]);
};

// Update department
exports.updateDepartment = async (id, company_id, data) => {
    const sql = `
    UPDATE departments 
    SET name = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND company_id = ? AND deleted_at IS NULL
  `;

    return db.execute(sql, [data.name, id, company_id]);
};

// Soft delete department
exports.deleteDepartment = async (id, company_id) => {
    const sql = `
    UPDATE departments 
    SET deleted_at = CURRENT_TIMESTAMP
    WHERE id = ? AND company_id = ? AND deleted_at IS NULL
  `;
    return db.execute(sql, [id, company_id]);
};
