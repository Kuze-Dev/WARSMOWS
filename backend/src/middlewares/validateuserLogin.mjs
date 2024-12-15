import { body, validationResult } from 'express-validator';

const validateUserLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required.')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('password')
        .trim()
        .notEmpty().withMessage('Password is required.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.json({ failed: 'false', message: 'Validation Failed', errors: errors.array() });
        }
        next();
    }
];

export { validateUserLogin };
