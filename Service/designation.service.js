const Designation = require("../models/designation.model");
const Department = require("../models/department.model");

exports.createDesignation = async (data, company_id) => {
    const { name, department_id } = data;
    if (!name || !department_id) throw new Error("Name and department_id are required");

    // Validate if department belongs to company
    const [department] = await Department.findById(department_id, company_id);
    if (department.length === 0) {
        throw new Error("Invalid department_id");
    }

    // Check availability
    const [existing] = await Designation.findByName(name, department_id);
    if (existing.length > 0) {
        throw new Error("Designation already exists in this department");
    }

    const [result] = await Designation.createDesignation({ name, department_id });
    return { id: result.insertId, name, department_id };
};

exports.getAllDesignations = async (company_id, page = 1, limit = 10) => {
    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 10;

    const [designations] = await Designation.findByCompanyId(company_id, page, limit);
    const [countResult] = await Designation.countByCompanyId(company_id);
    const total = countResult[0].total;

    return {
        data: designations,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

exports.updateDesignation = async (id, company_id, data) => {
    const { name } = data;
    if (!name) throw new Error("Designation name is required");

    // We must validate that this designation belongs to the company indirectly via department
    const [existingWithCompany] = await Designation.findByIdAndCompanyId(id, company_id);

    if (existingWithCompany.length === 0) {
        throw new Error("Designation not found or access denied");
    }

    const designation = existingWithCompany[0];

    // Check name availability in the same department
    if (name !== designation.name) {
        const [duplicate] = await Designation.findByName(name, designation.department_id);
        if (duplicate.length > 0) {
            throw new Error("Designation name already exists in this department");
        }
    }

    await Designation.updateDesignation(id, { name });
    return { message: "Designation updated successfully" };
};

exports.deleteDesignation = async (id, company_id) => {
    // Validate ownership
    const [existingWithCompany] = await Designation.findByIdAndCompanyId(id, company_id);
    if (existingWithCompany.length === 0) {
        throw new Error("Designation not found or access denied");
    }

    await Designation.deleteDesignation(id);
    return { message: "Designation deleted successfully" };
};
