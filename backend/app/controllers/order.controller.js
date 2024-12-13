const mongoose = require('mongoose');
const { Order, OrderItem } = require('../models/order.model');
const Card = require('../models/card.model');
const emailService = require('../services/email.service');
const fetch = require('node-fetch');
require('dotenv').config();

exports.createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, totalAmount, paymentDetails } = req.body;

        // Validate required fields
        if (!items || !shippingAddress || !totalAmount || !paymentDetails) {
            return res.status(400).json({ message: "Missing required order fields." });
        }

        // Create order items
        const orderItems = await Promise.all(items.map(async (item) => {
            if (!item.cardId || !item.quantity) {
                throw new Error("Invalid order item: Missing cardId or quantity.");
            }

            const orderItem = new OrderItem({
                card: item.cardId,
                quantity: item.quantity
            });
            return await orderItem.save();
        }));

        // Construct and save the order
        const order = new Order({
            user: req.userId || null,
            items: orderItems.map(item => item._id),
            shippingAddress,
            totalAmount,
            paymentDetails,
            paymentStatus: "Paid",
            orderStatus: "Processing"
        });

        const savedOrder = await order.save();

        // Populate the saved order for the response
        const populatedOrder = await Order.findById(savedOrder._id)
            .populate({
                path: 'items',
                populate: {
                    path: 'card',
                    model: 'Card',
                    select: 'name image price beltRank achievement clubName'
                }
            });

        // Log success for debugging
        console.log("Order created successfully:", populatedOrder);

        // Send response immediately to the client
        res.status(201).json(populatedOrder);

        // Handle asynchronous tasks (email and notifications) after response
        process.nextTick(async () => {
            try {
                // Send order confirmation email
                await emailService.sendOrderConfirmation(populatedOrder);

                // Trigger order processing webhook
                await fetch('https://order-processor-ewexgkcvhnhzbqhc.canadacentral-01.azurewebsites.net/api/process-order', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Origin': 'https://kyoso-backend-dhheg8akajdre6ce.canadacentral-01.azurewebsites.net'
                    },
                    body: JSON.stringify({ orderId: savedOrder._id.toString() })
                })
                .catch(error => {
                    console.error("Error triggering order processing:", error.message);
                    // Optionally update order status to indicate processing failed
                    Order.findByIdAndUpdate(savedOrder._id, { orderStatus: "ProcessingFailed" })
                        .catch(err => console.error("Error updating order status:", err));
                });
                console.log("Asynchronous tasks completed: Email and webhook triggered.");
            } catch (asyncError) {
                console.error("Error in asynchronous tasks:", asyncError.message);
            }
        });
    } catch (error) {
        console.error("Error creating order:", error.message);
        res.status(500).json({ message: "Error creating order", error: error.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.userId;
        const orders = await Order.find({ user: userId })
            .populate({
                path: 'items',
                populate: {
                    path: 'card',
                    model: 'Card'
                }
            })
            .sort({ createdAt: -1 });

        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ message: "Error fetching orders", error: err.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Validate if orderId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ 
                message: "Invalid order ID format", 
                error: `Provided orderId: ${orderId} is not a valid ObjectId`
            });
        }

        // Fetch the order with populated data
        const order = await Order.findById(orderId)
            .select('-user -paymentDetails')  // Exclude user ID and payment details
            .populate({
                path: 'items',
                populate: {
                    path: 'card',
                    model: 'Card',
                    select: 'name image price beltRank achievement clubName'
                }
            });

        // Check if the order exists
        if (!order) {
            return res.status(404).json({ 
                message: "Order not found", 
                error: `No order exists with the ID: ${orderId}`
            });
        }

        // Log missing card details in the populated data for debugging
        if (order.items.some(item => !item.card)) {
            console.warn(`Order ID ${orderId}: Some cards in the order items could not be populated.`);
        }

        // Respond with the found order
        res.status(200).json(order);
    } catch (err) {
        console.error(`Error fetching order with ID ${req.params.orderId}:`, err.message);
        res.status(500).json({ 
            message: "Error fetching order", 
            error: err.message 
        });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus } = req.body;
        const orderId = req.params.orderId;
        
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Validate the status is one of the allowed values
        const validStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];
        if (!validStatuses.includes(orderStatus)) {
            return res.status(400).json({ message: "Invalid order status" });
        }

        order.orderStatus = orderStatus;
        await order.save();

        // Return populated order data
        const populatedOrder = await Order.findById(orderId)
            .populate({
                path: 'items',
                populate: {
                    path: 'card',
                    model: 'Card'
                }
            });

        res.status(200).json(populatedOrder);
    } catch (err) {
        res.status(500).json({ message: "Error updating order status", error: err.message });
    }
};
