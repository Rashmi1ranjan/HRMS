const RoleService = require("../Service/role.service");

// Create role
exports.createRole = async (req, res) => {
    try {
        const company_id = req.company.id; // From JWT token
        const result = await RoleService.createRole(req.body, company_id);

        res.status(201).json({
            success: true,
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Get all roles
exports.getRoles = async (req, res) => {
    try {
        const company_id = req.company.id; // From JWT token
        const roles = await RoleService.getRoles(company_id);

        res.status(200).json({
            success: true,
            data: roles,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get role by ID
exports.getRoleById = async (req, res) => {
    try {
        const company_id = req.company.id; // From JWT token
        const role = await RoleService.getRoleById(req.params.id, company_id);

        res.status(200).json({
            success: true,
            data: role,
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

// Update role
exports.updateRole = async (req, res) => {
    try {
        const company_id = req.company.id; // From JWT token
        const result = await RoleService.updateRole(
            req.params.id,
            company_id,
            req.body
        );

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete role
exports.deleteRole = async (req, res) => {
    try {
        const company_id = req.company.id; // From JWT token
        const result = await RoleService.deleteRole(req.params.id, company_id);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
