const config = require('../config/auth.config');
const db = require('../models');
const User = db.user;
const Role = db.role;

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.signup = async (req, res) => {
    try {
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
        });

        const savedUser = await user.save();
        let authorities = [];

        if (req.body.roles) {
            const roles = await Role.find({ name: { $in: req.body.roles } });
            savedUser.roles = roles.map(role => role._id);
            await savedUser.save();
            authorities = roles.map(role => "ROLE_" + role.name.toUpperCase());
        } else {
            const role = await Role.findOne({ name: "user" });
            savedUser.roles = [role._id];
            await savedUser.save();
            authorities = ["ROLE_USER"];
        }

        const token = jwt.sign({ id: savedUser.id }, config.secret, {
            algorithm: 'HS256',
            allowInsecureKeySizes: true,
            expiresIn: 86400, // 24 hours
        });

        res.status(200).send({
            id: savedUser._id,
            username: savedUser.username,
            email: savedUser.email,
            roles: authorities,
            token: token
        });
    } catch (err) {
        res.status(500).send({ message: err.message || "An error occurred" });
    }
};

exports.signin = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username })
            .populate("roles", "-__v");

        if (!user) {
            return res.status(404).send({ message: "User Not found." });
        }

        const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

        if (!passwordIsValid) {
            return res.status(401).send({ message: "Invalid Password!" });
        }

        const token = jwt.sign({ id: user.id }, config.secret, {
            algorithm: 'HS256',
            allowInsecureKeySizes: true,
            expiresIn: 86400, // 24 hours
        });

        const authorities = user.roles.map(role => "ROLE_" + role.name.toUpperCase());

        res.status(200).send({
            id: user._id,
            username: user.username,
            email: user.email,
            roles: authorities,
            token: token
        });
    } catch (err) {
        res.status(500).send({ message: err.message || "An error occurred" });
    }
};

exports.signout = (req, res) => {
    try {
        req.session = null;
        return res.status(200).send({ message: "You've been signed out!" });
    } catch (err) {
        this.next(err);
    }
};

exports.createGuestToken = (req, res) => {
  const { guestId, email } = req.body;
  
  // Create a JWT token for the guest
  const token = jwt.sign(
    { 
      id: guestId,
      isGuest: true,
      email: email 
    },
    config.secret,
    {
      expiresIn: 86400 // 24 hours
    }
  );

  res.status(200).send({
    token,
    type: "Bearer"
  });
};
