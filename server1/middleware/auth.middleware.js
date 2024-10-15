// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.authenticate = async (req, res, next) => {
    try {
      const token = req.header('Authorization').replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ "_id": decoded.id, "isActive": true });
  
      if (!user) {
        throw new Error('User not found');
      }
  
      console.log('Authenticated User:', {
        id: user._id,
        role: user.role,
        permissions: user.permissions
      });
  
      req.user = user;
      req.token = token;
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({ message: 'Please authenticate' });
    }
  };
  
  exports.authorize = (roles = [], permissions = []) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
  
      console.log('Authorization Check:', {
        userRole: req.user.role,
        userPermissions: req.user.permissions,
        requiredRoles: roles,
        requiredPermissions: permissions
      });
  
      const hasRole = roles.length === 0 || roles.includes(req.user.role);
      const hasPermission = permissions.length === 0 || 
        (Array.isArray(req.user.permissions) && req.user.permissions.some(p => permissions.includes(p)));
  
      if (hasRole || hasPermission) {
        return next();
      }
  
      res.status(403).json({ message: 'Access denied' });
    };
  };