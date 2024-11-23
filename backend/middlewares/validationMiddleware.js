const { body, validationResult } = require('express-validator');

// Validation for registration form
const validateUserRegistration = [
    body('email')
        .isEmail()
        .withMessage('Veuillez entrer un email valide')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Le mot de passe doit avoir au moins 6 caractères'),
    body('name')
        .notEmpty()
        .withMessage('Le nom est requis')
        .trim()
];


// Middleware to check validation results
const checkValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = { checkValidation ,validateUserRegistration }