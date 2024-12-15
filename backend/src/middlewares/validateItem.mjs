import { body, validationResult } from 'express-validator';

const validateItem = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required.')
        .matches(/^[A-Za-z0-9\s\-]+$/).withMessage('Title should contain only letters, numbers, spaces, and hyphens.'),
    body('type')
        .trim()
        .notEmpty().withMessage('Select Type of Item'),
    body('pos_item')
        .trim()
        .notEmpty().withMessage('POS Item is required.'),
    body('reorder')
        .trim()
        .notEmpty().withMessage('Reorder is required.')
        .isNumeric().withMessage('Reorder level must be a number.')
        .custom(value => parseInt(value) > 0).withMessage('Reorder level must be greater than 0.'),
        body('deliver')
        .trim()
        .custom((value, { req }) => {
            if (req.body.isDisabled === 'true') {
                // If the field is disabled, accept 0 as a valid value
                if (parseFloat(value) === 0) {
                    return true;
                }
            } else {
                // If the field is not disabled, check if it's empty
                if (!value) {
                    throw new Error('Deliver is required.');
                }
                // If the field is not disabled, value must be greater than 0
                if (parseFloat(value) <= 0) {
                    throw new Error('Deliver level must be greater than 0.');
                }
            }
            return true;
        }),
    
    body('pick_up')
        .trim()
        .custom((value, { req }) => {
            if (req.body.isDisabled === 'true' && parseFloat(value) === 0) {
                return true; // Accept 0 if the field is disabled
            } else {
                // If the field is not disabled, check if it's empty
                if (!value) {
                    throw new Error('Pick Up is required.');
                }
                // If the field is not disabled, value must be greater than 0
                if (parseFloat(value) <= 0) {
                    throw new Error('Pick Up level must be greater than 0.');
                }
            }
            return true;
        }),
    
    body('buy')
        .trim()
        .notEmpty().withMessage('Buy is required.')
        .custom((value, { req }) => {
            if (req.body.disableBuy === 'true' && parseFloat(value) === 0) {
                return true; // Accept 0 if the field is disabled
            }
            // Check if value is empty or less than or equal to 0
            if (!value || parseFloat(value) <= 0) {
                throw new Error('Buy level must be greater than 0.');
            }
            return true;
        }),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.json({ failed: 'false', message: 'Validation Failed', errors: errors.array() });
        }
        next();
    },
    (req, res, next) => {
        // Validate that Image Item is provided
        if (!req.file || !req.file.filename) {
            return res.json({ failed: 'false', msg: 'Image Item is required.', status_code: 0 });
        }
        next();
    }
];

export { validateItem };
