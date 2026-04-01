const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token missing"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Standardizing the request object:
    // If it's a company login, 'id' is company_id and 'role' is superadmin
    // if it's a user login, the token should contain company_id, user_id, and role
    req.user = decoded; 
    
    // For backward compatibility while refactoring
    req.company = { id: decoded.company_id || decoded.id };

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
};
