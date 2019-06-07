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

// @route   GET api/auth
// @desc    Authenticate user & get token
// @access  public
router.post('/', [
    check('email', 'Please enter a valid email address.').isEmail(),
    check('password', 'Password is required.').exists()
], async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).send({ error: error.array() });
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send({ msg: 'Invalid Email or Password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({ msg: 'Invalid Email or Password' });
        }

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
