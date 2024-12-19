import { body, validationResult } from 'express-validator';

const validateCustomer = [
  body('firstname')
    .trim()
    .notEmpty().withMessage('Firstname is required')
    .isLength({ min: 2 }).withMessage('Firstname must be at least 2 characters long'),

  body('lastname')
    .trim()
    .notEmpty().withMessage('Lastname is required')
    .isLength({ min: 2 }).withMessage('Lastname must be at least 2 characters long'),

  body('gender')
    .trim()
    .notEmpty().withMessage('Gender is required')
    .isIn(['Male', 'Female']).withMessage('Gender must be Male or Female'),

  body('alias')
    .trim()
    // .optional()
    .notEmpty().withMessage('Alias/comment is required.')
    .isLength({ max: 50 }).withMessage('Alias/comment cannot exceed 50 characters'),

  body('email')
    .trim()
    // .optional()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),

  body('date_of_birth')
    .trim()
    .notEmpty().withMessage('Date of Birth is required')
    .isDate().withMessage('Please provide a valid date'),

  body('mobile1')
    .trim()
    .notEmpty().withMessage('Mobile 1 is required')
    .isLength({ min: 11 }).withMessage('Mobile 1 must be at least 11 digits long')
    .isMobilePhone().withMessage('Please provide a valid mobile number'),

    body('mobile2')
    .optional({ checkFalsy: true }) // Allows null or empty strings to pass
    .isLength({ min: 11 }).withMessage('Mobile 2 must be at least 11 digits long') // Only validate if a value is provided
    .isMobilePhone().withMessage('Please provide a valid mobile number'),
  

  body('house_number')
    .trim()
    .optional({ checkFalsy: true }) // Optional field, allows empty strings or falsy values
    .isNumeric().withMessage('House Number must be a number'),

  body('sitio')
    .trim()
    .notEmpty().withMessage('Purok/Sitio is required')
    .isLength({ max: 50 }).withMessage('Purok/Sitio cannot exceed 50 characters'),

  body('barangay')
    .trim()
    .notEmpty().withMessage('Barangay is required'),

  body('city')
    .trim()
    .notEmpty().withMessage('City is required'),

  body('province')
    .trim()
    .notEmpty().withMessage('Province is required'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ failed: false, message:'Validation Failed',  errors: errors.array() });
    }
    next();
  }
];

export { validateCustomer };
