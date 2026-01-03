import bcrypt from 'bcryptjs';
export async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}
export async function comparePassword(password, hashedPassword) {
    try {
        return await bcrypt.compare(password, hashedPassword);
    }
    catch (e) {
        console.error('Password comparison error:', e);
        return false;
    }
}
//# sourceMappingURL=bcrypt.js.map