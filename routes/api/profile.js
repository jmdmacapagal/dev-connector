const router = require('express').Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile
// @desc    get current user profile
// @access  private
router.get('/me', auth, async (req, res) => {
    try {
        // get profile from user schema, with id from req.user -- get name and avatar prop from user
        const profile = await Profile.findOne({ user: req.user.id }).populate(['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile from this user.' });
        }
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
