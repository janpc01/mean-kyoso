const mongoose = require('mongoose');

// Define a schema for cards
const Card = mongoose.model(
    "Card",
    new mongoose.Schema({
        name: { type: String, required: true },
        beltRank: { type: String, required: true },
        achievement: { type: String, required: true },
        clubName: { type: String, required: true },
        image: { type: String, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}));

// Define the User schema
const User = mongoose.model(
    "User",
    new mongoose.Schema({
        username: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        roles: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Role"
            }
        ],
    })
);

module.exports = User;
