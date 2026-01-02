"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
const errorMiddleware_1 = require("../middleware/errorMiddleware");
class AuthController {
}
exports.AuthController = AuthController;
_a = AuthController;
AuthController.login = errorMiddleware_1.ErrorMiddleware.asyncHandler(async (req, res) => {
    const result = await authService_1.AuthService.login(req.body);
    res.json(result);
});
AuthController.getMe = errorMiddleware_1.ErrorMiddleware.asyncHandler(async (req, res) => {
    if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    const user = await authService_1.AuthService.getMe(req.user.id);
    res.json(user);
});
AuthController.verifySecret = errorMiddleware_1.ErrorMiddleware.asyncHandler(async (req, res) => {
    if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    const { secretPassword } = req.body;
    const result = await authService_1.AuthService.verifySecret(req.user.id, secretPassword);
    res.json(result);
});
AuthController.forgotPassword = errorMiddleware_1.ErrorMiddleware.asyncHandler(async (req, res) => {
    if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    const { email } = req.body;
    const result = await authService_1.AuthService.forgotPassword(req.user.id, email);
    res.json(result);
});
AuthController.verifyOTP = errorMiddleware_1.ErrorMiddleware.asyncHandler(async (req, res) => {
    if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    const { email, otp, token } = req.body;
    const result = await authService_1.AuthService.verifyOTP(req.user.id, email, otp, token);
    res.json(result);
});
AuthController.resetPassword = errorMiddleware_1.ErrorMiddleware.asyncHandler(async (req, res) => {
    if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    const { email, otp, token, newPassword } = req.body;
    const result = await authService_1.AuthService.resetPassword(req.user.id, email, otp, token, newPassword);
    res.json(result);
});
AuthController.validatePassword = errorMiddleware_1.ErrorMiddleware.asyncHandler(async (req, res) => {
    const { password } = req.body;
    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }
    const validation = await authService_1.AuthService.validatePassword(password);
    res.json(validation);
});
//# sourceMappingURL=authController.js.map