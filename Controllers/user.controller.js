const UserService = require("../Service/user.service");

// Create user
exports.createUser = async (req, res) => {
    try {
        const company_id = req.company.id; // From JWT token
        const result = await UserService.createUser(req.body, company_id);

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

// Get all users
exports.getUsers = async (req, res) => {
    try {
        const company_id = req.company.id; // From JWT token
        const users = await UserService.getUsers(company_id);

        res.status(200).json({
            success: true,
            data: users,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const company_id = req.company.id; // From JWT token
        const user = await UserService.getUserById(req.params.id, company_id);

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const company_id = req.company.id; // From JWT token
        const result = await UserService.updateUser(
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

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const company_id = req.company.id; // From JWT token
        const result = await UserService.deleteUser(req.params.id, company_id);

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
