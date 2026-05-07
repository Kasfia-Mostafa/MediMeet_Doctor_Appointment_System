const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password -refreshToken');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    if (!req.user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired', expired: true });
    }
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = protect;
