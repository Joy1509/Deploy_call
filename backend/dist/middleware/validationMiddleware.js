"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationMiddleware = void 0;
const zod_1 = require("zod");
const errors_1 = require("../utils/errors");
class ValidationMiddleware {
    static validateBody(schema) {
        return (req, res, next) => {
            try {
                const validatedData = schema.parse(req.body);
                req.body = validatedData;
                next();
            }
            catch (error) {
                if (error instanceof zod_1.z.ZodError) {
                    const errorMessages = error.issues.map((err) => `${err.path.join('.')}: ${err.message}`);
                    throw new errors_1.ValidationError(`Validation failed: ${errorMessages.join(', ')}`);
                }
                next(error);
            }
        };
    }
    static validateQuery(schema) {
        return (req, res, next) => {
            try {
                const validatedData = schema.parse(req.query);
                req.query = validatedData;
                next();
            }
            catch (error) {
                if (error instanceof zod_1.z.ZodError) {
                    const errorMessages = error.issues.map((err) => `${err.path.join('.')}: ${err.message}`);
                    throw new errors_1.ValidationError(`Query validation failed: ${errorMessages.join(', ')}`);
                }
                next(error);
            }
        };
    }
    static validateParams(schema) {
        return (req, res, next) => {
            try {
                const validatedData = schema.parse(req.params);
                req.params = validatedData;
                next();
            }
            catch (error) {
                if (error instanceof zod_1.z.ZodError) {
                    const errorMessages = error.issues.map((err) => `${err.path.join('.')}: ${err.message}`);
                    throw new errors_1.ValidationError(`Parameter validation failed: ${errorMessages.join(', ')}`);
                }
                next(error);
            }
        };
    }
}
exports.ValidationMiddleware = ValidationMiddleware;
//# sourceMappingURL=validationMiddleware.js.map