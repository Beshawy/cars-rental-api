const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const { uploadToCloudinary } = require('../utils/uploadImage');
const { validateEgyptianPhone, isAbove18, validatePasswordStrength, isNotPreviousPassword } = require('../utils/validator');
const bcrypt = require('bcryptjs');
const { sendEmail } = require('../utils/email');
const fs = require('fs');


exports.updateProfile = asyncHandler(async (req, res) => {

  if (req.body.password || req.body.passwordConfirm) {
    throw new AppError(
      'This route is not for password updates. Please use /updateMyPassword.',
      400
    );
  }


  const { name, dateOfBirth, address, phone } = req.body;
  const user = req.user;


  if (name) user.name = name.trim();

  if (dateOfBirth) {
    const dob = new Date(dateOfBirth);
    if (!isAbove18(dob)) {
      throw new AppError('You must be at least 18 years old', 400);
    }
    user.dateOfBirth = dob;
  }

  if (address) {

    if (typeof address === 'object') {
      user.address = {
        street: address.street || user.address.street,
        city: address.city || user.address.city,
        governorate: address.governorate || user.address.governorate,
        postalCode: address.postalCode || user.address.postalCode
      };
    }
  }


  let phoneVerificationMsg = '';
  if (phone && phone !== user.phone) {
    if (!validateEgyptianPhone(phone)) {
      throw new AppError('Please provide a valid Egyptian phone number', 400);
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      throw new AppError('Phone number already in use', 409);
    }

    user.phone = phone;
    // Activate verification logic
    user.phoneVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();


    phoneVerificationMsg = 'Phone number updated. Please verify your new number.';
  }

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: phoneVerificationMsg || 'Profile updated successfully',
    data: {
      user
    }
  });
});


exports.getMe = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    throw new AppError('User ID is required', 400);
  }


  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }



  const currentUser = req.user;
  if (currentUser.role !== 'admin' && currentUser._id.toString() !== userId) {
    throw new AppError('You do not have permission to view this profile', 403);
  }


  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    profileImage: user.profileImage,
    dateOfBirth: user.dateOfBirth,
    address: user.address,
    drivingLicense: user.drivingLicense,
    emailVerificationToken: user.emailVerificationToken ? 'exists' : null,
    totalBookings: user.totalBookings,
    totalSpent: user.totalSpent,
    rating: user.rating,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  res.status(200).json({
    status: 'success',
    data: {
      user: userResponse
    }
  });
});

exports.updateProfileImage = asyncHandler(async (req, res, next) => {

  if (!req.file) {
    throw new AppError('Profile image is required', 400);
  }
  const result = await uploadToCloudinary(
    req.file,
    "profile-images"
  );

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      profileImage: result.secure_url,
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    status: "success",
    message: "Profile image uploaded successfully",
    data: {
      profileImage: user.profileImage,
    },
  });
});

exports.uploadDrivingLicense = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(req.file, 'drivingLicenses');

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        'drivingLicense.imageUrl': result.secure_url,
        'drivingLicense.isVerified': false,
      },
      { new: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        drivingLicense: user.drivingLicense,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.changePassword = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new AppError('Current password and new password are required', 400);
  }

  if (newPassword !== confirmPassword) {
    throw new AppError('New password and confirm password do not match', 400);
  }

  if (newPassword === currentPassword) {
    throw new AppError('New password cannot be the same as current password', 400);
  }

  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isCurrentPasswordValid = await user.correctPassword(currentPassword, user.password);

  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect', 401);
  }

  const isPasswordStrong = validatePasswordStrength(newPassword);

  if (!isPasswordStrong.isValid) {
    throw new AppError(isPasswordStrong.message, 400);
  }

  const isNewPasswordAllowed = await isNotPreviousPassword(user, newPassword);

  if (!isNewPasswordAllowed) {
    throw new AppError('You cannot reuse one of your previous 5 passwords', 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  if (!user.passwordHistory) {
    user.passwordHistory = [];
  }

  if (user.passwordHistory.length >= 5) {
    user.passwordHistory.shift();
  }

  user.passwordHistory.push(user.password);
  user.password = hashedPassword;
  user.passwordChangedAt = Date.now();


  if (user.refreshTokens) {
    user.refreshTokens = [];
  }

  await user.save();

  try {
    const emailData = {
      to: user.email,
      subject: "password changed successfuly",
      text: "Your password has been changed successfully.",
      template: 'password-changed',
      context: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        profileImage: user.profileImage,
        dateOfBirth: user.dateOfBirth,
        address: user.address,
        drivingLicense: user.drivingLicense,
        emailVerificationToken: user.emailVerificationToken,
        totalBookings: user.totalBookings,
        totalSpent: user.totalSpent,
        rating: user.rating,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
    };
    await sendEmail(emailData);
  } catch (emailError) {
    console.log("Email Error : ", emailError);
  };


  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully',
  });
});

exports.deleteAccount = asyncHandler(async (req, res, next) => {

  const user = await User.findByIdAndDelete(req.user.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // TODO: Implement Cloudinary image deletion if needed
  // if(user.profileImage){
  //   await deleteFromCloudinary(user.profileImage);
  // }
  // if(user.drivingLicense){
  //   await deleteFromCloudinary(user.drivingLicense.imageUrl);
  // }

  await User.findByIdAndDelete(req.user.id);

  res.status(200).json({
    status: 'success',
    message: 'Account deleted successfully'
  })
});

