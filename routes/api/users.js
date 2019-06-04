const router = require('express').Router();
const { check, validationResult } = require('express-validator/check');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');

// @route   GET api/users
// @desc    test route
// @access  public

router.post('/', [
    check('name', 'Please enter your name.').not().isEmpty(), // field validation parameters
    check('email', 'Please enter a valid email address.').isEmail(),
    check('password', 'Please enter password, minimun of 6 characters.').isLength({ min: 6 })
], async (req, res) => {
    const error = validationResult(req); // check input if have no error
    if (!error.isEmpty()) {
        return res.status(400).send({ error: error.array() });
    }

    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email }); // check if email already exists
        if (user) {
            return res.status(400).send({ error: [{ msg: 'Email Already Exists.' }] });
        }

        // generate gravatar
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
        res.send('User Registered');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
