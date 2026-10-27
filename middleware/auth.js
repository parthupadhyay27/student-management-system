// =====================================================================
// JWT Authentication & Role-Based Authorization Middleware
// =====================================================================

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_enterprise_jwt_key_928374829104';

/**
 * Middleware: verifyToken
 * Validates the JWT Bearer token supplied in the Authorization header.
 * Attaches decoded user payload ({ id, role, email, username, dept_id }) to req.user.
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: 'Access Denied: Missing or malformed Authorization header. Expected Bearer token.'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Authentication failed: Token has expired. Please log in again.'
            });
        }
        return res.status(403).json({
            success: false,
            error: 'Authentication failed: Invalid or tampered token.'
        });
    }
};

/**
 * Middleware: requireRole
 * Enforces role-based access control (RBAC).
 * Accepts one or more role strings (e.g., 'admin', 'student').
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: User authentication context is missing.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `Forbidden: Access requires one of [${roles.join(', ')}] role(s). Your role is '${req.user.role}'.`
            });
        }

        next();
    };
};

module.exports = {
    verifyToken,
    requireRole
};
