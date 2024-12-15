import { body, validationResult } from 'express-validator';

const validateCreditPayment = [
    body('cash_paid')
        .notEmpty().withMessage('Cash Payment is required.')
        .isFloat({ gt: 0 }).withMessage('Please enter a payment amount greater than 0.')
        .toFloat(),
        

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.json({ failed: 'false', msg: 'Validation Failed', errors: errors.array() });
        }
        next();
    }
];

export { validateCreditPayment };
