const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const db = require('../models');
const User = db.user;
const Role = db.role;

verifyToken = async (req, res, next) => {
    try {
        let token = req.headers['x-access-token'];

        if (!token) {
            return res.status(403).send({ message: "No token provided!" });
        }

        // Allow guest tokens for payment intent creation
        if (token.startsWith('guest_')) {
            req.isGuest = true;
            req.userId = null;
            return next();
        }

        // Regular token verification
        const decoded = jwt.verify(token, config.secret);
        req.userId = decoded.id;
        req.isGuest = false;
        next();
    } catch (err) {
        res.status(401).send({ message: "Unauthorized!" });
    }
};


isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).send({ message: "User not found!" });
        }

        const roles = await Role.find({ _id: { $in: user.roles } });

        if (roles.some(role => role.name === "admin")) {
            return next();
        }

        res.status(403).send({ message: "Require Admin Role!" });
    } catch (err) {
        res.status(500).send({ message: err.message || "An error occurred" });
    }
};

isModerator = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).send({ message: "User not found!" });
        }

        const roles = await Role.find({ _id: { $in: user.roles } });

        if (roles.some(role => role.name === "moderator")) {
            return next();
        }

        res.status(403).send({ message: "Require Moderator Role!" });
    } catch (err) {
        res.status(500).send({ message: err.message || "An error occurred" });
    }
};

const authJwt = {
    verifyToken,
    isAdmin,
    isModerator,
};

module.exports = authJwt;
