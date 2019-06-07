const router = require('express').Router();
const { check, validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../../middleware/auth');
const User = require('../../models/User');

// @route   GET api/users
// @desc    test route
// @access  public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.send('Server Error');
    }
});

// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  public
router.post('/', [
    check('email', 'Please enter a valid email address.').isEmail(), // field validation parameters
    check('password', 'Password is required.').exists()
], async (req, res) => {
    const error = validationResult(req); // check if have errors in validation
    if (!error.isEmpty()) {
        return res.status(400).send({ error: error.array() });
    }

    const { email, password } = req.body;

    try {
        // check if email exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send({ msg: 'Invalid Email or Password' });
        }

        // check if password from db and input match
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({ msg: 'Invalid Email or Password' });
        }

        // get token
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, config.get('jwtSecret'),
            { expiresIn: 3600000 }, (err, token) => {
                if (err) throw err;
                res.json({ token });
            });
    } catch (err) {
        console.error(err.message);
        res.send('Server Error');
    }
});

module.exports = router;
