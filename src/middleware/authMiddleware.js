const asyncHandler = require('express-async-handler');
const jwtUtils = require('../utils/jwt');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');

/**
 * Middleware للتحقق من الـ token
 */
exports.protect = asyncHandler(async (req, res, next) => {
  // 1. استخراج الـ token
  const token = jwtUtils.extractToken(req);
  
  // 2. التحقق من صحة الـ token
  const decoded = jwtUtils.verifyToken(token);
  
  // 3. البحث عن المستخدم
  const currentUser = await User.findById(decoded.userId);
  
  if (!currentUser) {
    throw new AppError('The user belonging to this token no longer exists.', 401);
  }
  
  // 4. التحقق إذا المستخدم غير الباسورد بعد الـ token
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    throw new AppError('User recently changed password! Please log in again.', 401);
  }
  
  // 5. التحقق من حالة الحساب
  if (currentUser.status === 'suspended') {
    throw new AppError('Your account has been suspended. Please contact support.', 403);
  }
  
  if (currentUser.status === 'inactive') {
    throw new AppError('Your account is inactive. Please contact support.', 403);
  }
  
  // 6. إضافة المستخدم للـ request
  req.user = currentUser;
  req.userRole = decoded.role;
  
  next();
});

exports.isAdmin = asyncHandler(async (req, res, next) => {
  if (req.userRole !== 'admin') {
    throw new AppError('Access denied', 403);
  }
  next();
});


exports.restrictTo = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError(
        'You do not have permission to perform this action',
        403
      );
    }
    next();
  });
};

/**
 * Middleware للتحقق من رخصة القيادة
 */
exports.checkDrivingLicense = asyncHandler(async (req, res, next) => {
  if (!req.user.drivingLicense.verified) {
    throw new AppError(
      'Your driving license is not verified. Please upload and verify your license first.',
      403
    );
  }
  
  if (req.user.isLicenseExpired) {
    throw new AppError(
      'Your driving license has expired. Please update your license information.',
      403
    );
  }
  
  next();
});

