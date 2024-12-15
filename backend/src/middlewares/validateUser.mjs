    import { body, validationResult } from 'express-validator';

    const validateUser = [
        body('firstName')
            .trim()
            .notEmpty().withMessage('First name is required.')
            .matches(/^[A-Za-z\s]+$/).withMessage('First name should contain only letters and spaces.'),
        body('middleName')
            .trim()
            .notEmpty().withMessage('Middle name is required.')
            .isAlpha().withMessage('Middle name must contain only letters.'),
        body('lastName')
            .trim()
            .notEmpty().withMessage('Last name is required.')
            .isAlpha().withMessage('Last name must contain only letters.'),
        body('contact')
            .trim()
            .notEmpty().withMessage('Contact number is required.')
            .isMobilePhone().withMessage('Invalid contact number.')
            .isLength({ min: 11, max: 11 }).withMessage('Contact number must be exactly 11 digits.'),

        body('email')
            .trim()
            .notEmpty().withMessage('Email is required.')
            .isEmail().withMessage('Invalid Email Format.')
        .normalizeEmail(),
        body('gender')
            .trim()
            .notEmpty().withMessage('Gender is required.')
            .isIn(['Male', 'Female']).withMessage('Invalid gender.'),
        body('accountType')
            .trim()
            .notEmpty().withMessage('Account type is required.')
            .isIn(['Admin', 'POS User', 'Delivery Boy']).withMessage('Invalid account type.'),
        body('address')
            .trim()
            .notEmpty().withMessage('Address is required.'),
        body('username')
            .trim()
            .notEmpty().withMessage('Username is required.'),
        body('password')
            .trim()
            .notEmpty().withMessage('Password is required.')
            .isLength({ min: 6 }).withMessage('Password must be 6+ characters.'),
        body('retypePassword')
            .trim()
            .notEmpty().withMessage('Retype password is required.')
            .custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match.'),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.json({ failed: 'false', message: 'Validation Failed', errors: errors.array() });
            }
            next();
        },
        (req, res, next) => {
            // Validate that profile is provided
            if (!req.file || !req.file.filename) {
                return res.json({ failed: 'false', msg: 'Profile image is required.', status_code: 0 });
            }
            next();
        }
    ];

    export { validateUser };
