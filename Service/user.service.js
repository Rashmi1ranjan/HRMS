const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const Role = require("../models/role.model");

const Designation = require("../models/designation.model");

// Get all users with company, role and designation info
exports.getUsersWithCompany = async () => {
    const [rows] = await User.findUsersWithCompany();
    return { count: rows.length, data: rows };
};

// Create a new user
exports.createUser = async (data, company_id) => {
    const { name, email, password, role_id, designation_id, status } = data;

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

    // Validate designation if provided
    if (designation_id) {
        const [designationExists] = await Designation.findByIdAndCompanyId(designation_id, company_id);
        if (designationExists.length === 0) {
            throw new Error("Invalid designation_id for this company");
        }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await User.createUser({
        company_id,
        role_id,
        designation_id,
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

// Get all users for a company (paginated)
exports.getUsers = async (company_id, page = 1, limit = 10) => {
    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 10;

    const [users] = await User.findByCompanyId(company_id, page, limit);
    const [countResult] = await User.countByCompanyId(company_id);
    const total = countResult[0].total;

    return {
        data: users,          // password is not selected in the model query
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
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

    // Validate designation if provided
    if (data.designation_id && data.designation_id !== currentUser.designation_id) {
        const [designationExists] = await Designation.findByIdAndCompanyId(data.designation_id, company_id);
        if (designationExists.length === 0) {
            throw new Error("Invalid designation_id for this company");
        }
    }

    // Update user
    await User.updateUser(id, company_id, {
        name: name ?? currentUser.name,
        email: email ?? currentUser.email,
        role_id: role_id ?? currentUser.role_id,
        designation_id: data.designation_id ?? currentUser.designation_id,
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

// Search user by ID or Name
exports.searchUser = async (search, company_id) => {
    if (!search || search.trim() === "") {
        throw new Error("Search query is required");
    }

    const [rows] = await User.findByIdOrName(search.trim(), company_id);

    return {
        count: rows.length,
        data: rows,
    };
};

const jwt = require("jsonwebtoken");

// User Login
exports.login = async (data) => {
    const { email, password } = data;

    if (!email || !password) {
        throw new Error("Email and password are required");
    }

    // Find user by email (we need many details, so using a specific query or finding first)
    // Note: FindByEmail in model currently needs company_id. 
    // We might need a global findByEmail or require company_id in login.
    // Let's assume global login for now by adding a model method if needed, 
    // or just search across all if email is unique globally.
    // For now, let's use the DB instance directly for a simple global search if email is unique.
    const db = require("../config/db");
    const sql = `
        SELECT u.*, r.role_name 
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.email = ? AND u.deleted_at IS NULL
    `;
    const [rows] = await db.execute(sql, [email]);

    if (rows.length === 0) {
        throw new Error("Invalid email or password");
    }

    const user = rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Invalid email or password");
    }

    if (!user.status) {
        throw new Error("User account is inactive");
    }

    // Generate token
    const token = jwt.sign(
        {
            user_id: user.id,
            company_id: user.company_id,
            email: user.email,
            role: user.role_name,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role_name,
        company_id: user.company_id,
        token,
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
