const router = require('express').Router();

// @route   GET api/users
// @desc    test route
// @access  public
router.get('/', (req, res) => {
    res.send('Auth Route.');
});


module.exports = router;
