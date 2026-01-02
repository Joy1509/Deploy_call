"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordValidator = void 0;
class PasswordValidator {
    static validate(password) {
        const errors = [];
        let score = 0;
        // Length validation
        if (password.length < this.MIN_LENGTH) {
            errors.push(`Password must be at least ${this.MIN_LENGTH} characters long`);
        }
        else {
            score += 1;
            if (password.length >= 12)
                score += 1; // Bonus for longer passwords
        }
        if (password.length > this.MAX_LENGTH) {
            errors.push(`Password must not exceed ${this.MAX_LENGTH} characters`);
        }
        // Character type requirements
        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        if (!hasLowercase) {
            errors.push('Password must contain at least one lowercase letter');
        }
        else {
            score += 1;
        }
        if (!hasUppercase) {
            errors.push('Password must contain at least one uppercase letter');
        }
        else {
            score += 1;
        }
        if (!hasNumbers) {
            errors.push('Password must contain at least one number');
        }
        else {
            score += 1;
        }
        if (!hasSpecialChars) {
            errors.push('Password must contain at least one special character');
        }
        else {
            score += 1;
        }
        // Security pattern checks
        if (/(.)\1{2,}/.test(password)) {
            errors.push('Password cannot contain repeated characters (3 or more)');
            score -= 1;
        }
        // Check for common patterns
        for (const pattern of this.COMMON_PATTERNS) {
            if (pattern.test(password)) {
                errors.push('Password cannot contain common patterns or dictionary words');
                score -= 1;
                break;
            }
        }
        // Check for keyboard patterns
        if (this.hasKeyboardPattern(password)) {
            errors.push('Password cannot contain keyboard patterns (qwerty, asdf, etc.)');
            score -= 1;
        }
        // Determine strength based on score
        let strength = 'weak';
        if (score >= 6 && password.length >= 12) {
            strength = 'strong';
        }
        else if (score >= 4 && password.length >= 10) {
            strength = 'medium';
        }
        return {
            isValid: errors.length === 0,
            errors,
            strength,
            score: Math.max(0, score)
        };
    }
    static hasKeyboardPattern(password) {
        const keyboardPatterns = [
            'qwerty', 'asdf', 'zxcv', '1234', '4567', '7890',
            'qwertyuiop', 'asdfghjkl', 'zxcvbnm'
        ];
        const lowerPassword = password.toLowerCase();
        return keyboardPatterns.some(pattern => lowerPassword.includes(pattern) ||
            lowerPassword.includes(pattern.split('').reverse().join('')));
    }
    static generateSecurePassword(length = 16) {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        let password = '';
        // Ensure at least one character from each category
        password += this.getRandomChar(lowercase);
        password += this.getRandomChar(uppercase);
        password += this.getRandomChar(numbers);
        password += this.getRandomChar(special);
        // Fill the rest randomly
        const allChars = lowercase + uppercase + numbers + special;
        for (let i = 4; i < length; i++) {
            password += this.getRandomChar(allChars);
        }
        // Shuffle the password to avoid predictable patterns
        return this.shuffleString(password);
    }
    static getRandomChar(chars) {
        return chars[Math.floor(Math.random() * chars.length)];
    }
    static shuffleString(str) {
        return str.split('').sort(() => Math.random() - 0.5).join('');
    }
}
exports.PasswordValidator = PasswordValidator;
PasswordValidator.MIN_LENGTH = 8;
PasswordValidator.MAX_LENGTH = 128;
PasswordValidator.COMMON_PATTERNS = [
    /123/i, /abc/i, /qwe/i, /password/i, /admin/i, /user/i, /login/i
];
//# sourceMappingURL=passwordValidator.js.map