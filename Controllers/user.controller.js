const UserService = require("../Service/user.service");

// Get all users with company, role and designation info
exports.getUsersWithCompany = async (req, res) => {
    try {
        const result = await UserService.getUsersWithCompany();
        res.status(200).json({
            success: true,
            message: "Users with company info fetched successfully",
            ...result,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create user
exports.createUser = async (req, res) => {
    try {
        const company_id = req.company.id; // From JWT token
        const result = await UserService.createUser(req.body, company_id);

        res.status(201).json({
            success: true,
            message: "User created successfully",
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
        const { page = 1, limit = 10 } = req.query;
        const result = await UserService.getUsers(company_id, page, limit);

        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            ...result,
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
            message: "User fetched successfully",
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
            message: "User updated successfully",
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
            message: "User deleted successfully",
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
