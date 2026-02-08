const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { validateEmail, validatePassword, validateEgyptianPhone, validLicense, isAbove18 } = require('../utils/validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (email) {
          return validateEmail(email)
        },
        "message": "please enter a valid email address"
      }
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
      validate: {
        validator: function (password) {
          return validatePassword(password);
        },
        message: "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number and one special character"
      },
    },

    passwordChangedAt: Date,

    phone: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (phone) {
          return validateEgyptianPhone(phone);
        },
        message: "Please provide a valid Egyptian phone number (01XXXXXXXXX)"
      },
    },

    profileImage: {
      type: String,
      default: null,
    },


    role: {
      type: String,
      enum: ["admin", "customer", "manager"],
      default: "customer",
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },

    dateOfBirth: {
      type: Date,
      required: true,
      validate: {
        validator: function (dateOfBirth) {
          return isAbove18(dateOfBirth);
        },
        message: "You must be at least 18 years old"
      },
    },

    address: {
      street: String,
      city: String,
      governorate: String,
      postalCode: String
    },

    drivingLicense: {
      number: { type: String, required: true },
      expiryDate: {
        type: Date,
        required: true,
        validate: {
          validator: function (expiryDate) {
            return validLicense(expiryDate);
          },
          message: "Driving license has expired"
        }
      },
      imageUrl: { type: String, default: null },
      isVerified: { type: Boolean, default: false },
    },


    emailVerificationToken: {
      type: String,
      default: null,
    },

    emailVerificationExpires: {
      type: Date,
      default: null,
    },

    phoneVerificationCode: {
      type: String,
      default: null,
    },

    licenseVerificationToken: {
      type: String,
      default: null,
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },

    lastLogin: {
      type: Date,
      default: null,
    },


    totalBookings: {
      type: Number,
      default: 0,
    },

    totalSpent: {
      type: Number,
      default: 0,
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);


userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.pre('save', async function () {
  if (!this.isModified('password') || this.isNew) return;
  this.passwordChangedAt = Date.now() - 1000;
});


userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

userSchema.methods.incrementLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = undefined;
  } else {
    this.loginAttempts += 1;
    if (this.loginAttempts >= 5) {
      this.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes lock
    }
  }
  await this.save({ validateBeforeSave: false });
};

userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
};

userSchema.methods.isLocked = function () {
  if (!this.lockUntil) return false;
  return this.lockUntil > Date.now();
};


module.exports = mongoose.model("User", userSchema);