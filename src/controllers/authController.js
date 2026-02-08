const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const jwtUtils = require('../utils/jwt');
const { validateEmail, validatePassword, validateEgyptianPhone } = require('../utils/validator');
const { sendEmail } = require('../utils/email')

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, dateOfBirth, drivingLicense } = req.body;

  // =====================
  // 1. التحقق من البيانات المطلوبة
  // =====================
  if (!name || !email || !phone || !password || !dateOfBirth) {
    throw new AppError('Name, email, phone, password and dateOfBirth are required', 400);
  }

  // =====================
  // 2. التحقق من صحة البيانات
  // =====================
  if (!validateEmail(email)) {
    throw new AppError('Please provide a valid email address', 400);
  }

  if (!validatePassword(password)) {
    throw new AppError(
      'Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number and one special character',
      400
    );
  }

  if (!validateEgyptianPhone(phone)) {
    throw new AppError('Please provide a valid Egyptian phone number (01XXXXXXXXX)', 400);
  }

  // =====================
  // 3. التحقق من عدم تكرار الإيميل أو التليفون
  // =====================
  const existingUserByEmail = await User.findOne({ email });
  if (existingUserByEmail) {
    throw new AppError('Email already registered', 409);
  }

  const existingUserByPhone = await User.findOne({ phone });
  if (existingUserByPhone) {
    throw new AppError('Phone number already registered', 409);
  }

  // =====================
  // 4. التحقق من بيانات رخصة القيادة
  // =====================
  let licenseData = {};
  if (drivingLicense) {
    if (!drivingLicense.number || !drivingLicense.expiryDate) {
      throw new AppError('Driving license number and expiry date are required', 400);
    }

    const existingLicense = await User.findOne({
      'drivingLicense.number': drivingLicense.number.toUpperCase()
    });

    if (existingLicense) {
      throw new AppError('Driving license number already registered', 409);
    }

    const expiryDate = new Date(drivingLicense.expiryDate);
    if (expiryDate <= new Date()) {
      throw new AppError('Driving license has expired', 400);
    }

    licenseData = {
      number: drivingLicense.number.toUpperCase(),
      expiryDate: expiryDate,
      verified: false
    };
  }

  // =====================
  // 5. التحقق من تاريخ الميلاد
  // =====================
  const birthDate = new Date(dateOfBirth);
  if (isNaN(birthDate.getTime())) {
    throw new AppError('Invalid date of birth format', 400);
  }

  // =====================
  // 6. إنشاء المستخدم
  // =====================
  const userData = {
    name,
    email,
    phone,
    password,
    dateOfBirth: birthDate,
    role: 'customer',
    status: 'active',
    drivingLicense: licenseData,
    lastLogin: new Date()
  };

  const user = await User.create(userData);

  // =====================
  // 7. توليد JWT token
  // =====================
  const token = jwtUtils.signToken(user._id, user.role);

  // =====================
  // 8. إعداد بيانات الـ response
  // =====================
  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    drivingLicense: user.drivingLicense,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin
  };

  // =====================
  // 9. إرسال الـ response
  // =====================
  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    token,
    data: {
      user: userResponse
    }
  });
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = req.user;

  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    profileImage: user.profileImage,
    drivingLicense: user.drivingLicense,
    isEmailVerified: user.isEmailVerified,
    totalBookings: user.totalBookings,
    totalSpent: user.totalSpent,
    rating: user.rating,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt
  };

  res.status(200).json({
    status: 'success',
    data: {
      user: userResponse
    }
  });
});



exports.login = asyncHandler(async (req, res) => {
  // 1. Check if email/phone and password exist
  const { email, phone, password } = req.body;

  if ((!email && !phone) || !password) {
    throw new AppError('Please provide email/phone and password', 400);
  }

  // 2. Build Query
  // Find user by email or phone
  let user;
  if (email) {
    user = await User.findOne({ email }).select('+password');
  } else {
    user = await User.findOne({ phone }).select('+password');
  }

  // 3. User checks
  // Check if user exists & password is correct
  if (!user || !(await user.correctPassword(password, user.password))) {

    if (user) {
      await user.incrementLoginAttempts();
      if (user.loginAttempts >= 5) {
        throw new AppError('Account locked due to too many failed attempts. Please try again in 15 minutes.', 423);
      }
    }
    throw new AppError('Incorrect email/phone or password', 401);
  }

  // 4. Status checks
  if (user.status === 'suspended') {
    throw new AppError('Your account has been suspended. Please contact support.', 403);
  }

  if (user.status === 'inactive') {
    throw new AppError('Your account is inactive. Please contact support.', 403);
  }

  if (user.isLocked()) {
    const lockTime = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60));
    throw new AppError(`Account temporarily locked. Try again in ${lockTime} minutes`, 423);
  }

  // 5. Successful Login
  await user.resetLoginAttempts();
  user.lastLogin = new Date();
  user.lastActivity = new Date();
  await user.save({ validateBeforeSave: false });

  // 6. Generate Token
  const token = jwtUtils.signToken(user._id, user.role);

  // 7. Response
  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    profileImage: user.profileImage,
    drivingLicense: user.drivingLicense,
    isEmailVerified: user.isEmailVerified,
    dateOfBirth: user.dateOfBirth,
    totalBookings: user.totalBookings,
    totalSpent: user.totalSpent,
    rating: user.rating,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt
  };

  const warnings = [];
  if (!user.isEmailVerified) warnings.push('Your email is not verified.');
  if (user.drivingLicense.expiryDate && user.isLicenseExpired) warnings.push('Driving license expired.');
  if (user.drivingLicense.number && !user.drivingLicense.verified) warnings.push('Driving license not verified.');

  res.status(200).json({
    status: 'success',
    message: 'Logged in successfully',
    token, 
    data: {
      user: userResponse,
      ...(warnings.length > 0 && { warnings })
    }
  });
});


exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(new AppError('No user with this email', 404));

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

    const message = `
      <h1>Password Reset</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetURL}">${resetURL}</a>
      <p>This link is valid for only 10 minutes.</p>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Your Password Reset Token (valid for 10 minutes)',
      html: message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Reset link sent to your email'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Error sending email. Try again later.', 500));
  }
};



exports.resetPassword = asyncHandler(async (req, res) => {


  const token = req.headers.resettoken || req.headers['reset-token'];


  const { password } = req.body || {};

  if (!token) {
    throw new AppError('Reset token is required in header (resetToken)', 400);
  }

  if (!password) {
    throw new AppError('Password is required in request body', 400);
  }

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  if (!validatePassword(password)) {
    throw new AppError(
      'Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number and one special character',
      400
    );
  }

  user.password = password;

  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password reset successfully. Please login with your new password.'
  });
});


exports.logout = (req,res) =>{
  res.clearCookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'logget out successfuly' });
} ;



