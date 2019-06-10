const router = require('express').Router();
const { check, validationResult } = require('express-validator/check');
const auth = require('../../middleware/auth');

const User = require('../../models/User');
// const Profile = require('../../models/Profile');
const Post = require('../../models/Post');

// @route   POST api/posts
// @desc    create a post
// @access  private
router.post('/', [auth, [
    check('text', 'Text is required.').not().isEmpty() // field validation parameters
]], async (req, res) => {
    const error = validationResult(req); // check if have validation errors
    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
    }

    try {
        // find user by id
        const user = await User.findById(req.user.id).select('-password');

        // create new Post instance
        const newPost = new Post({
            user: req.user.id,
            text: req.body.text,
            name: user.name,
            avatar: user.avatar
        });

        // save to db
        await newPost.save();
        res.json(newPost);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error.');
    }
});

// @route   GET api/posts
// @desc    get all posts
// @access  private
router.get('/', auth, async (req, res) => {
    try {
        // find all post, and sort it by last added
        const posts = await Post.find().sort({ date: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error.');
    }
});

// @route   GET api/posts/:id
// @desc    get post by id
// @access  private
router.get('/:id', auth, async (req, res) => {
    try {
        // find post by id
        const post = await Post.findById(req.params.id);

        // check if post exist
        if (!post) {
            return res.status(404).json({ msg: 'Post not found.' });
        }
        res.json(post);
    } catch (err) {
        console.error(err.message);
        if (err.kind === ' ObjectId') {
            return res.status(404).json({ msg: 'Post not found.' });
        }
        res.status(500).send('Server Error.');
    }
});

// @route   DELETE api/posts/:id
// @desc    delete post by id
// @access  private
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // check if post exist
        if (!post) {
            return res.status(404).json({ msg: 'Post not found.' });
        }

        // check if current user is the owner of the post
        if (post.user.toString() !== req.user.id) {
            return res.status(404).json({ msg: 'User not authorized.' });
        }

        // remove from db
        await post.remove();
        res.json({ msg: 'Post removed.' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === ' ObjectId') {
            return res.status(404).json({ msg: 'Post not found.' });
        }
        res.status(500).send('Server Error.');
    }
});

module.exports = router;
