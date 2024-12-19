import { body,check, validationResult } from 'express-validator';

 const validateExpenses = [
    body('expense_name')
        .notEmpty()
        .withMessage('Expense name is required.'),

    body('expense_amount')
        .notEmpty()
        .withMessage('Expense amount is required.')
        .isFloat({ min: 0 })
        .withMessage('Expense amount must be a positive number.'),

        check('expense_image')
        .custom((_, { req }) => {
            if (!req.file) {
                throw new Error('Expense image is required.');
            }
            return true; // Indicate validation success
        }),

    body('expense_createdAt')
        .notEmpty()
        .withMessage('Expense creation date is required.'),

    // Middleware to handle validation errors
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.json({failed:'false',msg:'Failed to Validate',errors: errors.array() });
        }
        next();
    }
];

export {validateExpenses};
