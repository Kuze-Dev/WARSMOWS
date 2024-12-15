import { body, validationResult } from 'express-validator';

const validatePaymentNote = [
    body('payment_note')
        .notEmpty().withMessage('Payment note is required.')
        .isString().withMessage('Payment note must be a valid string.')
        .isLength({ max: 255 }).withMessage('Payment note cannot exceed 255 characters.'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.json({ failed: 'false', msg: 'Validation Failed', errors: errors.array() });
        }
        next();
    }
];

export { validatePaymentNote };
