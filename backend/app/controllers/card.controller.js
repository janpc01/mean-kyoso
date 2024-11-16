const { Card } = require('../models/user.model'); // Adjust path as needed

// Create a new card
exports.createCard = async (req, res) => {
    try {
        const { name, beltRank, achievement, clubName, image } = req.body;
        const userId = req.userId; // Assuming authJwt middleware sets req.userId

        const newCard = new Card({
            name,
            beltRank,
            achievement,
            clubName,
            image,
            userId,
        });

        await newCard.save();
        res.status(201).json(newCard);
    } catch (err) {
        res.status(500).json({ message: "Failed to create card", error: err.message });
    }
};

// Update an existing card
exports.updateCard = async (req, res) => {
    try {
        const { cardId } = req.params;
        const { name, beltRank, achievement, clubName, image } = req.body;

        const updatedCard = await Card.findByIdAndUpdate(
            cardId,
            { name, beltRank, achievement, clubName, image },
            { new: true } // Return the updated card
        );

        if (!updatedCard) {
            return res.status(404).json({ message: "Card not found" });
        }

        res.status(200).json(updatedCard);
    } catch (err) {
        res.status(500).json({ message: "Failed to update card", error: err.message });
    }
};

// Delete a card
exports.deleteCard = async (req, res) => {
    try {
        const { cardId } = req.params;

        const deletedCard = await Card.findByIdAndDelete(cardId);

        if (!deletedCard) {
            return res.status(404).json({ message: "Card not found" });
        }

        res.status(200).json({ message: "Card deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete card", error: err.message });
    }
};

// Retrieve all cards for a specific user
exports.getUserCards = async (req, res) => {
    try {
        const { userId } = req.params;

        const userCards = await Card.find({ userId });

        res.status(200).json(userCards);
    } catch (err) {
        res.status(500).json({ message: "Failed to retrieve cards", error: err.message });
    }
};
