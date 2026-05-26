const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(" ")[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided.",
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach company info to request
        req.company = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid token.",
        });
    }
};
