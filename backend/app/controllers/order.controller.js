const mongoose = require('mongoose');
const { Order, OrderItem } = require('../models/order.model');
const Card = require('../models/card.model');
const { sendAdminOrderNotification } = require('../services/email.service');

exports.createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, totalAmount } = req.body;
        const userId = req.userId;

        // Create order items first
        const orderItems = await Promise.all(items.map(async (item) => {
            const orderItem = new OrderItem({
                card: item.cardId,
                quantity: item.quantity
            });
            return await orderItem.save();
        }));

        // Create the main order
        const order = new Order({
            user: userId,
            items: orderItems.map(item => item._id),
            shippingAddress,
            totalAmount,
            paymentStatus: "Paid",
            orderStatus: "Processing"
        });

        const savedOrder = await order.save();
        
        // Populate the response with card details
        const populatedOrder = await Order.findById(savedOrder._id)
            .populate({
                path: 'items',
                populate: {
                    path: 'card',
                    model: 'Card'
                }
            });

        // Send email notification
        await sendAdminOrderNotification(populatedOrder);

        res.status(201).json(populatedOrder);
    } catch (err) {
        res.status(500).json({ message: "Error creating order", error: err.message });
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
        const order = await Order.findById(req.params.orderId)
            .populate({
                path: 'items',
                populate: {
                    path: 'card',
                    model: 'Card'
                }
            });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Check if the order belongs to the requesting user
        if (order.user.toString() !== req.userId) {
            return res.status(403).json({ message: "Not authorized to view this order" });
        }

        res.status(200).json(order);
    } catch (err) {
        res.status(500).json({ message: "Error fetching order", error: err.message });
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