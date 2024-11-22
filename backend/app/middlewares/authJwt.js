const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const db = require('../models');
const User = db.user;
const Role = db.role;

verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(403).send({ message: "No token provided!" });
        }

        const decoded = jwt.verify(token, config.secret);
        req.userId = decoded.id;
        next();
    } catch (err) {
        res.status(401).send({ message: "Unauthorized!" });
    }
};

module.exports = {
    verifyToken
};
