const router = require('express').Router();
const { check, validationResult } = require('express-validator/check')

// @route   GET api/users
// @desc    test route
// @access  public

router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email.').isEmail(),
    check('password', 'Please enter password with 6 or more characters.').isLength({ min: 6 })
], (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
    }
    res.send('User Route');
});


module.exports = router;
