const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'janpc01@gmail.com',
    pass: 'rjpg flfu tjpr hsba'
  }
});

const formatOrderItems = (items) => {
  return items.map(item => 
    `Card Details:
    - Name: ${item.card.name}
    - Belt Rank: ${item.card.beltRank}
    - Achievement: ${item.card.achievement}
    - Club Name: ${item.card.clubName}
    - Season: 2024/25
    - Quantity: ${item.quantity}
    - Price: $${item.card.price}
    - Subtotal: $${item.quantity * item.card.price}
    `
  ).join('\n\n');
};

const sendAdminOrderNotification = async (order) => {
  const emailContent = `
    New Order Received!
    
    Order ID: ${order._id}
    
    Order Items:
    ${formatOrderItems(order.items)}
    
    Total Amount: $${order.totalAmount}
    
    Shipping Information:
    Name: ${order.shippingAddress.fullName}
    Address: ${order.shippingAddress.addressLine1}
    ${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + '\n' : ''}
    City: ${order.shippingAddress.city}
    State/Province: ${order.shippingAddress.state}
    Postal Code: ${order.shippingAddress.postalCode}
    Country: ${order.shippingAddress.country}
    Phone: ${order.shippingAddress.phone}
    
    Order Status: ${order.orderStatus}
    Payment Status: Paid
  `;

  try {
    await transporter.sendMail({
      from: 'janpc01@gmail.com',
      to: 'janpc01@gmail.com',
      subject: `New Order Received - #${order._id}`,
      text: emailContent
    });
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
};

module.exports = { sendAdminOrderNotification };