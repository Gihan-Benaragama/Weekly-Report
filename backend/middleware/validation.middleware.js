import mongoose from 'mongoose';

/**
 * Validates req.body fields against a schema.
 * Schema field rules:
 *   required   : boolean
 *   type       : 'string' | 'number' | 'email' | 'date' | 'array' | 'objectId'
 *   minLength  : number (strings)
 *   maxLength  : number (strings)
 *   min        : number (numbers)
 *   max        : number (numbers)
 *   enum       : string[] | number[]
 *   trim       : boolean — check if value is non-empty after trimming
 *   pattern    : RegExp
 *   patternMsg : string — custom error for pattern failure
 */
export const validateRequest = (schema) => {
    return (req, res, next) => {
        const errors = [];

        for (const [field, rules] of Object.entries(schema)) {
            const raw = req.body[field];
            const value = rules.trim && typeof raw === 'string' ? raw.trim() : raw;
            const isEmpty = value === undefined || value === null || value === '';

            // ── Required ──────────────────────────────────────────────────
            if (rules.required && isEmpty) {
                errors.push(`'${field}' is required.`);
                continue;
            }
            // Skip optional empty fields
            if (isEmpty) continue;

            // ── Type checks ───────────────────────────────────────────────
            if (rules.type === 'string' && typeof value !== 'string') {
                errors.push(`'${field}' must be a string.`);
                continue;
            }

            if (rules.type === 'number') {
                if (typeof value !== 'number' || isNaN(value)) {
                    errors.push(`'${field}' must be a valid number.`);
                    continue;
                }
            }

            if (rules.type === 'email') {
                if (typeof value !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    errors.push(`'${field}' must be a valid email address.`);
                    continue;
                }
            }

            if (rules.type === 'date') {
                if (isNaN(Date.parse(value))) {
                    errors.push(`'${field}' must be a valid date (e.g. YYYY-MM-DD).`);
                    continue;
                }
            }

            if (rules.type === 'array') {
                if (!Array.isArray(value)) {
                    errors.push(`'${field}' must be an array.`);
                    continue;
                }
            }

            if (rules.type === 'objectId') {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    errors.push(`'${field}' must be a valid ID.`);
                    continue;
                }
            }

            // ── String length ─────────────────────────────────────────────
            if (typeof value === 'string') {
                if (rules.minLength !== undefined && value.length < rules.minLength) {
                    errors.push(`'${field}' must be at least ${rules.minLength} characters.`);
                }
                if (rules.maxLength !== undefined && value.length > rules.maxLength) {
                    errors.push(`'${field}' must be no more than ${rules.maxLength} characters.`);
                }
            }

            // ── Numeric range ─────────────────────────────────────────────
            if (typeof value === 'number') {
                if (rules.min !== undefined && value < rules.min) {
                    errors.push(`'${field}' must be at least ${rules.min}.`);
                }
                if (rules.max !== undefined && value > rules.max) {
                    errors.push(`'${field}' must be no greater than ${rules.max}.`);
                }
            }

            // ── Enum ──────────────────────────────────────────────────────
            if (rules.enum && !rules.enum.includes(value)) {
                errors.push(`'${field}' must be one of: ${rules.enum.join(', ')}.`);
            }

            // ── Pattern ───────────────────────────────────────────────────
            if (rules.pattern && !rules.pattern.test(value)) {
                errors.push(rules.patternMsg || `'${field}' has an invalid format.`);
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({ message: errors[0], errors });
        }

        next();
    };
};
