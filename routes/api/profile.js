const router = require('express').Router();

// @route   GET api/profile
// @desc    test route
// @access  public
router.get('/', (req, res) => {
    res.send('Profile Route.');
});


module.exports = router;
