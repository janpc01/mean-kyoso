const mongoose = require('mongoose');
const Card = require('../models/card.model'); // Adjust path as needed
const { ObjectId } = mongoose.Types;

// Create a new card
exports.createCard = async (req, res) => {
    try {
        const { name, beltRank, achievement, clubName, image } = req.body;
        const userId = req.userId;

        console.log('Received data:', { name, beltRank, achievement, clubName, image, userId });

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const newCard = new Card({
            name,
            beltRank,
            achievement,
            clubName,
            image,
            userId,
            printCount: 0 // Add default print count
        });

        const savedCard = await newCard.save();
        console.log('Card saved successfully:', savedCard);
        res.status(201).json(savedCard);
    } catch (err) {
        console.error('Error in createCard:', err);
        res.status(500).json({ 
            message: "Failed to create card", 
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
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

        // Validate if userId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }

        const userCards = await Card.find({ userId: userId });

        console.log('User cards:', userCards);
        res.status(200).json(userCards);
    } catch (err) {
        console.error('Error in getUserCards:', err); // Add this for debugging
        res.status(500).json({ 
            message: "Failed to retrieve cards", 
            error: err.message 
        });
    }
};

// Increment the print count for a card
exports.incrementPrintCount = async (req, res) => {
    try {
        const { cardId } = req.params;

        const card = await Card.findByIdAndUpdate(
            cardId,
            { $inc: { printCount: 1 } }, // Increment printCount by 1
            { new: true } // Return the updated card
        );

        if (!card) {
            return res.status(404).send("Card not found.");
        }

        res.status(200).json({ message: "Card print count updated.", card });
    } catch (err) {
        res.status(500).send("Failed to update print count.");
    }
};

// Get all cards
exports.getAllCards = async (req, res) => {
    try {
      const cards = await Card.find()
        .populate('userId', 'username')
        .sort({ createdAt: -1 });
      res.status(200).json(cards);
    } catch (err) {
      res.status(500).json({ message: "Failed to retrieve cards", error: err.message });
    }
  };
  
  // Search cards
  exports.searchCards = async (req, res) => {
    try {
      const query = req.query.q;
      const cards = await Card.find({
        name: { $regex: query, $options: 'i' }  // Only search by name
      }).populate('userId', 'username');
      
      res.status(200).json(cards);
    } catch (err) {
      res.status(500).json({ message: "Failed to search cards", error: err.message });
    }
  };
