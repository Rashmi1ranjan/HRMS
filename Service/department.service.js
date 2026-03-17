const Department = require("../models/department.model");

exports.createDepartment = async (data, company_id) => {
    const { name } = data;
    if (!name) throw new Error("Department name is required");

    // Check if department name already exists for this company
    const [existing] = await Department.findByName(name, company_id);
    if (existing.length > 0) {
        throw new Error("Department already exists in this company");
    }

    const [result] = await Department.createDepartment({ name, company_id });
    return { id: result.insertId, name, company_id };
};

exports.getAllDepartments = async (company_id, page = 1, limit = 10) => {
    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 10;

    const [departments] = await Department.findByCompanyId(company_id, page, limit);
    const [countResult] = await Department.countByCompanyId(company_id);
    const total = countResult[0].total;

    return {
        data: departments,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

exports.updateDepartment = async (id, company_id, data) => {
    const { name } = data;
    if (!name) throw new Error("Department name is required");

    const [existing] = await Department.findById(id, company_id);
    if (existing.length === 0) {
        throw new Error("Department not found");
    }

    // Check availability of new name if changed
    if (name !== existing[0].name) {
        const [duplicate] = await Department.findByName(name, company_id);
        if (duplicate.length > 0) {
            throw new Error("Department name already exists");
        }
    }

    await Department.updateDepartment(id, company_id, { name });
    return { message: "Department updated successfully" };
};

exports.deleteDepartment = async (id, company_id) => {
    const [existing] = await Department.findById(id, company_id);
    if (existing.length === 0) {
        throw new Error("Department not found");
    }

    await Department.deleteDepartment(id, company_id);
    return { message: "Department deleted successfully" };
};
