import { body, validationResult } from 'express-validator';

// Middleware to validate quantity and free
const validatePayment = [

   // Validate if a customer is selected
   body('selectedCustomer')
     .notEmpty().withMessage('Please select a customer.'),

// Validate quantity for the first item (must be entered and > 0)
body('items[0].quantity')
  .custom((value) => {
    if (!value || Number(value) <= 0) {
      throw new Error('Quantity is required and must be greater than 0 for the first item.');
    }
    return true;
  }),

  // Check if the selected customer is "Guest" and cash validation
  body('selectedCustomer')
    .custom((value, { req }) => {
      if (value?.firstname === 'Guest') {
        const cashValue = parseFloat(req.body.cash);
        if (!cashValue || cashValue <= 0) {
          throw new Error('Cash is required for Guest customers and must be greater than 0.');
        }
      }
      return true;
    }),

 
  // Validate free (must be a number and >= 0)
  body('items.*.free')
    .isFloat({ min: 0 }).withMessage('Free must be a non-negative number'),

  // Validate discountPercentage (must be a number and >= 0)
  body('discountPercentage')
    .isFloat({ min: 0, max: 99 }).withMessage('Discount must be between 0 and 100'),

  // Validate cash (only validate if cash > 0)
  body('cash')
    .isFloat({ min: 0 }).withMessage('Cash must be a non-negative number')
    .custom((value, { req }) => {
      const cashValue = parseFloat(value);
      const totalDueValue = parseFloat(req.body.totalDue);

      // Only validate if cash is greater than 0
      if (cashValue > 0 && cashValue < totalDueValue) {
        throw new Error('Cash cannot be less than the total due amount');
      }
      return true;
    }),

  // Check for validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ failed: true, errors: errors.array() }); // Removed status(400)
    }
    next();
  }
];

export { validatePayment };
