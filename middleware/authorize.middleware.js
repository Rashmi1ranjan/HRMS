const authorize = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User information missing"
            });
        }

        const userRole = req.user.role;

        // superadmin has full access to everything
        if (userRole === 'superadmin') {
            return next();
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `Forbidden: Access denied for role '${userRole}'`
            });
        }

        next();
    };
};

/**
 * Middleware to allow self-access or specific roles
 * @param {Array} allowedRoles - Roles that can access any resource
 * @param {String} paramName - Name of the route param containing the resource ID
 */
const authorizeSelfOrRoles = (allowedRoles = [], paramName = 'id') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const userRole = req.user.role;
        const userId = req.user.user_id || req.user.id; // user_id for users, id for company login
        const resourceId = req.params[paramName];

        // superadmin has full access
        if (userRole === 'superadmin') {
            return next();
        }

        // Check if user is the owner (self)
        if (userId && resourceId && String(userId) === String(resourceId)) {
            return next();
        }

        // Check if user has an allowed role
        if (allowedRoles.length > 0 && allowedRoles.includes(userRole)) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: "Forbidden: You can only update your own record or require higher permissions"
        });
    };
};

module.exports = { authorize, authorizeSelfOrRoles };
