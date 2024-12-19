import { body, validationResult } from 'express-validator';

// Validation rules for stock in
const stockInValidation = [
    body('quantity_in')
        .notEmpty().withMessage('Quantity in is required.')
        .isNumeric().withMessage('Quantity in must be a number.')
        .isInt({ min: 1 }).withMessage('Quantity in must be greater than 0.'),

    body('price')
        .notEmpty().withMessage('Price is required.')
        .isFloat({ gt: 0 }).withMessage('Price must be a positive number.'),

    body('date_stockIn')
        .notEmpty().withMessage('Stock In Date is required.')
        .isISO8601().withMessage('Date must be a valid date in ISO format (YYYY-MM-DD).'),

    body('comments_in')
        .notEmpty().withMessage('Comments are required.')
        .isLength({ max: 255 }).withMessage('Comments should not exceed 255 characters.'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.json({ failed: 'false', errors: errors.array() });
        }
        next();
    }
];

// Validation rules for stock out
const stockOutValidation = [
    body('quantity_out')
        .notEmpty().withMessage('Quantity out is required.')
        .isNumeric().withMessage('Quantity out must be a number.')
        .isInt({ min: 0 }).withMessage('Quantity out must be 0 or greater.'),

    body('stock_status')
        .notEmpty().withMessage('Stock status is required.')
        .notEmpty().withMessage('Select Type of Stock Status'),

    body('date_stockOut')
        .optional({ nullable: true }).isISO8601().withMessage('Date must be a valid date in ISO format (YYYY-MM-DD).'),

    body('comments_out')
        .notEmpty().withMessage('Comments are required.')
        .isLength({ max: 255 }).withMessage('Comments should not exceed 255 characters.'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.json({ failed: 'false', errors: errors.array() });
        }
        next();
    }
];

export { stockInValidation, stockOutValidation };
