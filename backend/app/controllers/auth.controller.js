const config = require('../config/auth.config');
const db = require('../models');
const User = db.user;
const Role = db.role;

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.signup = async (req, res) => {
    try {
        const user = new User({
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
    const user = await User.findOne({ email: req.body.email }).populate("roles");
    
    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }

    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    
    if (!passwordIsValid) {
      return res.status(401).send({ message: "Invalid Password!" });
    }

    const token = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: 86400 // 24 hours
    });

    // Set cookie with correct options for cross-origin
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: true, // Always use secure in production
      sameSite: 'none', // Important for cross-origin
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/' // Ensure cookie is available for all paths
    });

    const authorities = user.roles.map(role => "ROLE_" + role.name.toUpperCase());

    res.status(200).send({
      id: user._id,
      email: user.email,
      roles: authorities
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.signout = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 0,
    path: '/'
  });
  res.status(200).send({ message: "Signed out successfully!" });
};

exports.verify = (req, res) => {
  const token = req.cookies.jwt;
  
  if (!token) {
    return res.status(401).send({ message: "No token provided!" });
  }

  try {
    const decoded = jwt.verify(token, config.secret);
    // Add user info to response
    res.status(200).send({ 
      message: "Token is valid",
      userId: decoded.id
    });
  } catch (err) {
    res.status(401).send({ message: "Unauthorized!" });
  }
};
