/**
 * Authentication & Authorization Middleware (Production JWT + RBAC)
 */
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const { authorizeEndpointAccess } = require('../services/validationService');

const DEFAULT_JWT_SECRET = 'matchwork-jwt-secret-key-2026';

function getJwtSecret() {
  return process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
}

/**
 * Generate signed JWT token with userId and role
 */
function generateToken(user) {
  const userId = user.id || user.userId || user.sub;
  const payload = {
    userId,
    sub: userId,
    email: user.email,
    role: user.role,
    name: user.name,
    candidate_id: user.candidate_id || null,
    job_id: user.job_id || null
  };
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

/**
 * Verify a JWT token and return decoded payload or null
 */
function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (err) {
    return null;
  }
}

/**
 * Resolve authenticated user object from Authorization: Bearer <token>
 */
function getAuthenticatedUser(req) {
  const authHeader = req.headers && req.headers.authorization;
  if (!authHeader || typeof authHeader !== 'string') return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  const token = parts[1];
  const payload = verifyToken(token);
  if (!payload) return null;

  const userId = payload.userId || payload.sub;
  let user = (userId && db.findUserById(userId)) ||
             (payload.email && db.findUserByEmail(payload.email)) ||
             null;

  if (user) {
    const safeUser = { ...user, userId: user.id };
    delete safeUser.password;
    return safeUser;
  }

  return {
    id: userId,
    userId,
    email: payload.email,
    role: payload.role,
    name: payload.name,
    candidate_id: payload.candidate_id || null,
    job_id: payload.job_id || null
  };
}

/**
 * Express Middleware: Authenticate JWT from Authorization: Bearer <token>
 * Attaches decoded/resolved user info to req.user
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers && req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Missing or invalid Authorization Bearer token (401 Unauthorized)',
      error: 'Unauthorized'
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Invalid or expired JWT token (401 Unauthorized)',
      error: 'Unauthorized'
    });
  }

  const userId = decoded.userId || decoded.sub;
  const dbUser = (userId && db.findUserById(userId)) ||
                 (decoded.email && db.findUserByEmail(decoded.email)) ||
                 null;

  if (dbUser) {
    const safeUser = { ...dbUser, userId: dbUser.id };
    delete safeUser.password;
    req.user = safeUser;
  } else {
    req.user = {
      id: userId,
      userId,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
      candidate_id: decoded.candidate_id || null,
      job_id: decoded.job_id || null
    };
  }

  next();
}

/**
 * Express Middleware: Require Admin role on req.user
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Authentication required',
      error: 'Unauthorized'
    });
  }

  const rawRole = req.user.role;
  const role = (rawRole || '').toString().trim().toLowerCase();

  if (role !== 'admin') {
    const auth = authorizeEndpointAccess(role, 'manage_tags');
    return res.status(403).json({
      success: false,
      message: auth.reason || `Access Denied: Role '${rawRole}' is not authorized for Admin operations (403 Forbidden)`,
      error: 'Forbidden'
    });
  }

  req.adminUser = req.user;
  next();
}

/**
 * Combined Admin Role Middleware factory (backward-compatible helper)
 */
function requireAdminRole(resource = 'manage_tags') {
  return (req, res, next) => {
    authenticateToken(req, res, () => {
      const rawRole = req.user && req.user.role;
      const role = (rawRole || '').toString().trim().toLowerCase();
      if (role !== 'admin') {
        const auth = authorizeEndpointAccess(role, resource);
        return res.status(403).json({
          success: false,
          message: auth.reason || `Access Denied: Role '${rawRole}' is not authorized for Admin operations (403 Forbidden)`,
          error: 'Forbidden'
        });
      }
      req.adminUser = req.user;
      next();
    });
  };
}

module.exports = {
  generateToken,
  verifyToken,
  authenticateToken,
  requireAdmin,
  getAuthenticatedUser,
  requireAdminRole,
  generateMockJwt: generateToken,
  verifyJwt: verifyToken
};
