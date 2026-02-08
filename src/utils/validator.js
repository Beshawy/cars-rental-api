const validator = require('validator');

exports.validateEmail = (email) => {
    return validator.isEmail(email);
};

exports.validatePassword = (password) => {
    const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})");
    return strongRegex.test(password);
};

exports.validateEgyptianPhone = (phoneNumber) => {
    const egyptianPhoneRegex = new RegExp("^01[0-2]{1}[0-9]{8}$");
    return egyptianPhoneRegex.test(phoneNumber);
};

exports.validLicense = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry > today;
};

exports.isAbove18 = (birthDate) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const month = today.getMonth() - birth.getMonth();

    if (age > 18) return true;
    if (age === 18 && month >= 0) return true;
    return false;
};

const validatePasswordStrength = (password) => {
    if (!password || password.trim() === '') {
        return {
            isValid: false,
            message: "password is required"
        };
    }

    if (password.length < 8) {
        return {
            isValid: false,
            message: "password must be at least 8 characters long"
        };
    }

    if (/\s/.test(password)) {
        return {
            isValid: false,
            message: "password must not contain spaces"
        };
    }

    if (!/[A-Z]/.test(password)) {
        return {
            isValid: false,
            message: "password must contain at least one uppercase letter (A-Z)"
        };
    }

    if (!/[a-z]/.test(password)) {
        return {
            isValid: false,
            message: "password must contain at least one lowercase letter (a-z)"
        };
    }

    if (!/\d/.test(password)) {
        return {
            isValid: false,
            message: "password must contain at least one digit (0-9)"
        };
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return {
            isValid: false,
            message: "password must contain at least one special character (!@#$%^&*)"
        };
    }

    const commonPasswords = [
        'password', '12345678', 'qwerty123', 'admin123',
        'password123', 'letmein', 'welcome', 'monkey'
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
        return {
            isValid: false,
            message: "password is too common, please choose a stronger password"
        };
    }

    return {
        isValid: true,
        message: 'password is strong'
    };
};

const isNotPreviousPassword = async (user, newPassword) => {
    if (!user.passwordHistory || user.passwordHistory.length === 0) {
        return true;
    }

    for (const oldPasswordHash of user.passwordHistory) {
        const isMatch = await bcrypt.compare(newPassword, oldPasswordHash);
        if (isMatch) {
            return false;
        }
    }

    return true;
};



module.exports = {
    validateEmail: exports.validateEmail,
    validatePassword: exports.validatePassword,
    validateEgyptianPhone: exports.validateEgyptianPhone,
    validLicense: exports.validLicense,
    isAbove18: exports.isAbove18,
    validatePasswordStrength,
    isNotPreviousPassword
};