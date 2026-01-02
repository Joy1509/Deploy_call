"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const userService_1 = require("../services/userService");
const errorMiddleware_1 = require("../middleware/errorMiddleware");
class UserController {
}
exports.UserController = UserController;
_a = UserController;
UserController.getAllUsers = errorMiddleware_1.ErrorMiddleware.asyncHandler(async (req, res) => {
    const users = await userService_1.UserService.getAllUsers();
    res.json(users);
});
UserController.createUser = errorMiddleware_1.ErrorMiddleware.asyncHandler(async (req, res) => {
    const user = await userService_1.UserService.createUser(req.body);
    res.status(201).json(user);
});
UserController.updateUser = errorMiddleware_1.ErrorMiddleware.asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    const user = await userService_1.UserService.updateUser(userId, req.body);
    res.json(user);
});
UserController.deleteUser = errorMiddleware_1.ErrorMiddleware.asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    await userService_1.UserService.deleteUser(userId);
    res.json({ success: true });
});
//# sourceMappingURL=userController.js.map