const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const Role = require("../models/role.model");

// Create a new user
exports.createUser = async (data, company_id) => {
    const { name, email, password, role_id, status } = data;

    // Validate required fields
    if (!name || !email || !password || !role_id) {
        throw new Error("Name, email, password, and role_id are required");
    }

    // Check if email already exists for this company
    const [existing] = await User.findByEmail(email, company_id);
    if (existing.length > 0) {
        throw new Error("Email already exists for this company");
    }

    // Validate role exists and belongs to company
    const [roleExists] = await Role.findById(role_id, company_id);
    if (roleExists.length === 0) {
        throw new Error("Invalid role_id for this company");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await User.createUser({
        company_id,
        role_id,
        name,
        email,
        password: hashedPassword,
        status: status ?? true,
    });

    return {
        message: "User created successfully",
        user_id: result.insertId,
    };
};

// Get all users for a company
exports.getUsers = async (company_id) => {
    const [users] = await User.findByCompanyId(company_id);

    // Remove password from response
    return users.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    });
};

// Get user by ID
exports.getUserById = async (id, company_id) => {
    const [rows] = await User.findById(id, company_id);

    if (rows.length === 0) {
        throw new Error("User not found");
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = rows[0];
    return userWithoutPassword;
};

// Update user
exports.updateUser = async (id, company_id, data) => {
    const { name, email, role_id, status, password } = data;

    // Check if user exists
    const [existing] = await User.findById(id, company_id);
    if (existing.length === 0) {
        throw new Error("User not found");
    }

    const currentUser = existing[0];

    // Check if new email conflicts with existing user
    if (email && email !== currentUser.email) {
        const [duplicate] = await User.findByEmail(email, company_id);
        if (duplicate.length > 0) {
            throw new Error("Email already exists for this company");
        }
    }

    // Validate role if provided
    if (role_id && role_id !== currentUser.role_id) {
        const [roleExists] = await Role.findById(role_id, company_id);
        if (roleExists.length === 0) {
            throw new Error("Invalid role_id for this company");
        }
    }

    // Update user
    await User.updateUser(id, company_id, {
        name: name ?? currentUser.name,
        email: email ?? currentUser.email,
        role_id: role_id ?? currentUser.role_id,
        status: status ?? currentUser.status,
    });

    // Update password if provided
    if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.updatePassword(id, company_id, hashedPassword);
    }

    return {
        message: "User updated successfully",
    };
};

// Delete user
exports.deleteUser = async (id, company_id) => {
    // Check if user exists
    const [existing] = await User.findById(id, company_id);
    if (existing.length === 0) {
        throw new Error("User not found");
    }

    // Soft delete
    await User.deleteUser(id, company_id);

    return {
        message: "User deleted successfully",
    };
};
