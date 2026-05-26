const Role = require("../models/role.model");

// Create a new role
exports.createRole = async (data, company_id) => {
    const { role_name, status } = data;

    // Validate required fields
    if (!role_name) {
        throw new Error("Role name is required");
    }

    // Check if role already exists for this company
    const [existing] = await Role.findByRoleName(role_name, company_id);
    if (existing.length > 0) {
        throw new Error("Role name already exists for this company");
    }

    // Create role
    const [result] = await Role.createRole({
        role_name,
        company_id,
        status: status ?? true,
    });

    return {
        message: "Role created successfully",
        role_id: result.insertId,
    };
};

// Get all roles for a company
exports.getRoles = async (company_id) => {
    const [roles] = await Role.findByCompanyId(company_id);
    return roles;
};

// Get role by ID
exports.getRoleById = async (id, company_id) => {
    const [rows] = await Role.findById(id, company_id);

    if (rows.length === 0) {
        throw new Error("Role not found");
    }

    return rows[0];
};

// Update role
exports.updateRole = async (id, company_id, data) => {
    const { role_name, status } = data;

    // Check if role exists
    const [existing] = await Role.findById(id, company_id);
    if (existing.length === 0) {
        throw new Error("Role not found");
    }

    // Check if new role name conflicts with existing role
    if (role_name && role_name !== existing[0].role_name) {
        const [duplicate] = await Role.findByRoleName(role_name, company_id);
        if (duplicate.length > 0) {
            throw new Error("Role name already exists for this company");
        }
    }

    // Update role
    await Role.updateRole(id, company_id, {
        role_name: role_name ?? existing[0].role_name,
        status: status ?? existing[0].status,
    });

    return {
        message: "Role updated successfully",
    };
};

// Delete role
exports.deleteRole = async (id, company_id) => {
    // Check if role exists
    const [existing] = await Role.findById(id, company_id);
    if (existing.length === 0) {
        throw new Error("Role not found");
    }

    // Soft delete
    await Role.deleteRole(id, company_id);

    return {
        message: "Role deleted successfully",
    };
};
