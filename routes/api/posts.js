/* eslint-disable max-len */
/* eslint-disable no-shadow */
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

// @route   PUT api/posts/like/:id
// @desc    like a post
// @access  private
router.put('/like/:id', auth, async (req, res) => {
    try {
        // find post by id
        const post = await Post.findById(req.params.id);

        // check if the post has been already liked by the user
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({ msg: 'Post has been liked.' });
        }

        // insert to like array using unshift
        post.likes.unshift({ user: req.user.id });

        // save to db
        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error.');
    }
});

// @route   PUT api/posts/unlike/:id
// @desc    unlike a post
// @access  private
router.put('/unlike/:id', auth, async (req, res) => {
    try {
        // find post by id
        const post = await Post.findById(req.params.id);

        // check if has no likes
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({ msg: 'Post has no likes.' });
        }

        // get index
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

        // remove like using splice
        post.likes.splice(removeIndex, 1);

        // save to db
        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error.');
    }
});

// @route   POST api/posts/comment/:id
// @desc    create comment on a post
// @access  private
router.post('/comment/:id', [auth, [
    check('text', 'Text is required.').not().isEmpty()
]], async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
    }

    try {
        // get user by id
        const user = await User.findById(req.user.id).select('-password');

        // get post to comment by id
        const post = await Post.findById(req.params.id);

        // create newComment object
        const newComment = {
            text: req.body.text,
            user: req.user.id,
            name: user.name,
            avatar: user.avatar
        };

        // insert into comments array
        post.comments.unshift(newComment);

        // save to db
        await post.save();
        res.json(post.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error.');
    }
});

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    delete comment
// @access  private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);

        if (!comment) {
            return res.status(404).json({ msg: 'Comment does not exist.' });
        }

        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized.' });
        }

        await post.comments.remove(comment);
        await post.save();
        res.json(post.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error.');
    }
});

module.exports = router;
