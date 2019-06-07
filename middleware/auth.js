/* eslint-disable func-names */
const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
    // get token from header
    const token = req.header('x-auth-token');

    // check if have token
    if (!token) {
        return res.status(401).json({ mgs: 'No token, Access Denied' });
    }
    // Verify the token
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        req.user = decoded.user;
        next();
    } catch (error) {
        console.error(error.message);
        res.status(401).send({ msg: 'Invalid Token ' });
    }
};
