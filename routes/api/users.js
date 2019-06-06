const router = require('express').Router();
const { check, validationResult } = require('express-validator/check');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../../models/User');

// @route   GET api/users
// @desc    test route
// @access  public

router.post('/', [
    check('name', 'Please enter your name.').not().isEmpty(), // field validation parameters
    check('email', 'Please enter a valid email address.').isEmail(),
    check('password', 'Please enter a minimum of 6 characters.').isLength({ min: 6 })
], async (req, res) => {
    const error = validationResult(req); // check if input has no errors
    if (!error.isEmpty()) {
        return res.status(400).send({ error: error.array() });
    }

    const { name, email, password } = req.body;

    try {
        // check if email already exist
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).send({ error: [{ msg: 'Email Already Exist' }] });
        }

        // set up gravatar
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        });

        // create new user instance
        user = new User({
            name,
            email,
            avatar,
            password
        });

        // hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // save user to db
        // name: req.body.name || name
        // email: req.body.email || email
        // avatar: avatar (gravatar)
        // password: user.password ( hashed from req.body.password )
        await user.save();

        // get jwt token
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
        res.status(500).send('Server Error.');
    }
});

module.exports = router;
