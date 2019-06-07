/* eslint-disable func-names */
const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
    // get token
    const token = req.header('x-auth-token');

    // check if there is token
    if (!token) {
        return res.status(400).json({ msg: 'No token, Access Denied.' });
    }

    // verify the existing token
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        req.user = decoded.user;
        next();
    } catch (error) {
        console.error(error.message);
        res.send('Server Error');
    }
};
