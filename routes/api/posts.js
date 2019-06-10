const router = require('express').Router();
const { check, validationResult } = require('express-validator/check');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const User = require('../../models/User');
const Profile = require('../../models/Profile');

// @route   POST api/posts
// @desc    create a post
// @access  private
router.post('/', [auth, [
    check('text', 'Text is required.').not().isEmpty()
]], async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array });
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
        const newPost = new Post({
            user: req.user.id,
            text: req.body.text,
            name: user.name,
            avatar: user.avatar
        });
        await newPost.save();
        res.json(newPost);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/posts
// @desc    get all posts
// @access  private
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });
        res.json(posts);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error.');
    }
});

module.exports = router;
