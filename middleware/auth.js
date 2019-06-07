/* eslint-disable func-names */
const jwt = require('jsonwebtoken');
const config = require('config');


module.exports = function (req, res, next) {
    // get token from header
    const token = req.header('x-auth-token');

    // check if there is a token
    if (!token) {
        return res.status(401).send('No token, Access Denied');
    }

    // verify token
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        req.user = decoded.user;
        next();
    } catch (error) {
        console.error(error.message);
        res.send('Invalid Token');
    }
};
