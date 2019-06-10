const router = require('express').Router();
const { check, validationResult } = require('express-validator/check');
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile/me
// @desc    get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    // get profile from user schema, with id from req.user -- get name and avatar prop from user
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate(['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile from this user.' });
        }
        res.json({ profile });
    } catch (error) {
        console.errror(error.message);
        res.status(500).send('Server Error');
    }
});


// @route   POST api/profile
// @desc    Create and Update User profile
// @access  Private
router.post('/', [auth, [
    check('status', 'Status is required.').not().isEmpty(), // field validation parameters
    check('skills', 'Skills is required').not().isEmpty()
]], async (req, res) => {
    const error = validationResult(req); // check fields if have errors
    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
    }

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        twitter,
        facebook,
        youtube,
        instagram,
        linkedin
    } = req.body; // destructuring of req.body

    // build profileFields objects
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) profileFields.skills = skills.split(',').map(skill => skill.trim());

    // build profileFields.social object
    profileFields.social = {};
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (youtube) profileFields.social.youtube = youtube;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
        let profile = await Profile.findOne({ user: req.user.id });
        // update profile if existing
        if (profile) {
            // can use findOneAndUpdate but have deprecation warning
            profile = await Profile.updateMany({ user: req.user.id },
                { $set: profileFields },
                { new: true });
            return res.json(profile);
        }

        // create if don't exist
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).json('Server Error');
    }
});
module.exports = router;
