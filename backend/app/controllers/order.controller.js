const mongoose = require('mongoose');
const { Order, OrderItem } = require('../models/order.model');
const Card = require('../models/card.model');
const emailService = require('../services/email.service');
const axios = require('axios');

exports.createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, totalAmount, paymentDetails } = req.body;
        
        const orderItems = await Promise.all(items.map(async (item) => {
            const orderItem = new OrderItem({
                card: item.cardId,
                quantity: item.quantity
            });
            return await orderItem.save();
        }));

        const order = new Order({
            items: orderItems.map(item => item._id),
            shippingAddress,
            totalAmount,
            paymentStatus: "Paid",
            orderStatus: "Processing",
            isGuestOrder: true,
            guestEmail: shippingAddress.email
        });

        const savedOrder = await order.save();
        const populatedOrder = await Order.findById(savedOrder._id)
            .populate({
                path: 'items',
                populate: {
                    path: 'card',
                    model: 'Card',
                    select: 'name image price beltRank achievement clubName'
                }
            });

        // Send response immediately
        res.status(201).json(populatedOrder);

        // Handle notifications and processing asynchronously
        Promise.all([
            emailService.sendAdminOrderNotification(populatedOrder),
            axios.post('http://localhost:3001/api/process-order', {
                orderId: savedOrder._id
            })
        ]).catch(error => {
            console.error('Error in async operations:', error);
        });

    } catch (error) {
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
        const order = await Order.findById(req.params.orderId)
            .populate({
                path: 'items',
                populate: {
                    path: 'card',
                    model: 'Card',
                    select: 'name image price beltRank achievement clubName'
                }
            });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (!order.isGuestOrder && order.user && order.user.toString() !== req.userId) {
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