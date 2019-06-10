const router = require('express').Router();
const { check, validationResult } = require('express-validator/check');
const config = require('config');
const request = require('request');
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile/me
// @desc    get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    // get profile from user schema, with id from req.user -- get name and avatar prop from user
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);
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
    check('skills', 'Skills is required').not().isEmpty(), // field validation parameters
    check('status', 'Status is required').not().isEmpty()
]], async (req, res) => {
    const error = validationResult(req); // check if validation have no error
    if (!error.isEmpty()) {
        return res.status(400).send({ error: error.array() });
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
        instagram,
        youtube,
        linkedin
    } = req.body; // destructuring of req.body

    // build profileFields object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (bio) profileFields.bio = bio;
    if (skills) profileFields.skills = skills.split(',').map(skill => skill.trim());

    // build profileFields.social object
    profileFields.social = {};
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (instagram) profileFields.social.instagram = instagram;
    if (youtube) profileFields.social.youtube = youtube;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
        // search if profile exist
        let profile = await Profile.findOne({ user: req.user.id });
        // update if existing
        if (profile) {
            profile = await Profile.findOneAndUpdate({ user: req.user.id },
                { $set: profileFields },
                { new: true });
            return res.json(profile);
        }

        // create if not exisiting
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   Get api/profile
// @desc    get all profiles
// @access  Public
router.get('/', async (req, res) => {
    try {
        // find all existing profiles
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        if (!profiles) { // check if there are profiles
            return res.status(400).json({ error: 'There are no profiles' });
        }
        res.json(profiles);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// @route   Get api/profile/user/:user_id
// @desc    Get profile by user id
// @access  Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({ msg: 'Profile not found.' });
        }
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Profile not found.' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/profile
// @desc    delete profile, user & post
// @access  Private
router.delete('/', auth, async (req, res) => {
    try {
        await Profile.findOneAndRemove({ user: req.user.id }); // delete Profile
        await User.findByIdAndRemove({ _id: req.user.id }); // delete User
        res.json({ msg: 'User deleted.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});


// @route   PUT api/profile/experience
// @desc    add profile experience
// @access  Private
router.put('/experience', [auth, [
    check('title', 'Title is required.').not().isEmpty(), // field validation parameters
    check('company', 'Company is required.').not().isEmpty(),
    check('from', 'From date is required.').not().isEmpty()
]], async (req, res) => {
    const error = validationResult(req); // check if validation have error
    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array });
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body; // destructuring req.body

    // create newExp object that will contain all input from req.body
    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    };

    try {
        // find profile
        const profile = await Profile.findOne({ user: req.user.id });
        // unshift newExp to profile.experience array
        profile.experience.unshift(newExp);
        await profile.save(); // save to db
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error.');
    }
});

// @route   PUT api/profile/experience/:exp_id
// @desc    delete experience
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        // search profile of user
        const profile = await Profile.findOne({ user: req.user.id });
        // get index of item to delete
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
        // remove using splice
        profile.experience.splice(removeIndex, 1);
        await profile.save(); // save to db
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/profile/education
// @desc    add education
// @access  Private
router.put('/education', [auth, [
    check('school', 'School is required.').not().isEmpty(),
    check('degree', 'Degree is required.').not().isEmpty(),
    check('fieldofstudy', 'Field of study is required.').not().isEmpty(),
    check('from', 'From date is required.').not().isEmpty()
]], async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
    }

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;

    const newEduc = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    };

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.education.unshift(newEduc);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/profile/education/:educ_id
// @desc    delete education
// @access  Private
router.delete('/education/:educ_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.educ_id);
        profile.education.splice(removeIndex, 1);
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/profile/github/:username
// @desc    get user repos from github
// @access  public
router.get('/github/:username', async (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')},
            method: 'GET`,
            headers: { 'user-agent': 'node.js' }
        };

        request(options, (error, response, body) => {
            if (error) console.error(error);
            if (response.statusCode !== 200) {
                return res.status(400).json({ msg: 'No Github profile found.' });
            }
            res.json(JSON.parse(body));
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error.');
    }
});

module.exports = router;
