/**
 * ============================================================
 * Role-Based Authorization Middleware
 * ============================================================
 * 
 * Restricts access to routes based on the authenticated user's
 * role (e.g., 'admin', 'doctor', 'patient'). Must be used
 * AFTER the `protect` middleware so that `req.user` is available.
 * 
 * Usage: router.get('/admin-only', protect, roleAuth('admin'), handler);
 *        router.get('/multi', protect, roleAuth('admin', 'doctor'), handler);
 * ============================================================
 */

/**
 * Returns an Express middleware that checks if the authenticated
 * user has one of the specified roles.
 * 
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'doctor', 'patient')
 * @returns {Function} Express middleware function
 */
const roleAuth = (...roles) => {
  return (req, res, next) => {
    // Ensure the user is authenticated (protect middleware should have run first)
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Check if the user's role is in the allowed roles list
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Role '${req.user.role}' is not authorized to access this resource` });
    }

    next(); // Role is authorized — proceed to the route handler
  };
};

module.exports = roleAuth;
