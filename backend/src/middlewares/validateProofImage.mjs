import { check, validationResult } from 'express-validator';

const validateProofImage = [
    // Validate that 'proof_image' file is present
    check('proof_image')
        .custom((_, { req }) => {
            if (!req.file) {
                throw new Error('Proof of delivery image is required.');
            }
            return true; // Indicate validation success
        }),
    
    // Middleware to handle errors
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.json({
                failed: true,
                errors: errors.array(),
            });
        }
        next();
    }
];

export { validateProofImage };
