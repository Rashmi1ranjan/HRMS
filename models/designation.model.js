const db = require("../config/db");

// Create a new designation
exports.createDesignation = async (data) => {
    const sql = `
    INSERT INTO designations 
    (name, department_id)
    VALUES (?, ?)
  `;

    return db.execute(sql, [data.name, data.department_id]);
};

// Find designation by ID
exports.findById = async (id) => {
    const sql = `
    SELECT * FROM designations 
    WHERE id = ? AND deleted_at IS NULL
  `;
    return db.execute(sql, [id]);
};

// Find designation by ID and Company ID (for validation)
exports.findByIdAndCompanyId = async (id, company_id) => {
    const sql = `
    SELECT d.* 
    FROM designations d
    JOIN departments dept ON d.department_id = dept.id
    WHERE d.id = ? AND dept.company_id = ? AND d.deleted_at IS NULL
  `;
    return db.execute(sql, [id, company_id]);
};

// Find all designations for a company (with pagination)
exports.findByCompanyId = async (company_id, page = 1, limit = 10) => {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    const sql = `
    SELECT d.*, dept.name as department_name
    FROM designations d
    JOIN departments dept ON d.department_id = dept.id
    WHERE dept.company_id = ? AND d.deleted_at IS NULL
    ORDER BY d.created_at DESC
    LIMIT ${limitNum} OFFSET ${offset}
  `;
    return db.execute(sql, [company_id]);
};

// Count all designations for a company
exports.countByCompanyId = async (company_id) => {
    const sql = `
    SELECT COUNT(*) AS total 
    FROM designations d
    JOIN departments dept ON d.department_id = dept.id
    WHERE dept.company_id = ? AND d.deleted_at IS NULL
  `;
    return db.execute(sql, [company_id]);
};

// Find all designations for a department
exports.findByDepartmentId = async (department_id) => {
    const sql = `
    SELECT * FROM designations 
    WHERE department_id = ? AND deleted_at IS NULL
    ORDER BY created_at DESC
  `;
    return db.execute(sql, [department_id]);
};

// Check if designation name exists for department
exports.findByName = async (name, department_id) => {
    const sql = `
    SELECT * FROM designations 
    WHERE name = ? AND department_id = ? AND deleted_at IS NULL
  `;
    return db.execute(sql, [name, department_id]);
};

// Update designation
exports.updateDesignation = async (id, data) => {
    const sql = `
    UPDATE designations 
    SET name = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND deleted_at IS NULL
  `;

    return db.execute(sql, [data.name, id]);
};

// Soft delete designation
exports.deleteDesignation = async (id) => {
    const sql = `
    UPDATE designations 
    SET deleted_at = CURRENT_TIMESTAMP
    WHERE id = ? AND deleted_at IS NULL
  `;
    return db.execute(sql, [id]);
};
