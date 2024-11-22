const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    const requiredVars = ['EMAIL_USER', 'EMAIL_PASSWORD'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required email configuration: ${missingVars.join(', ')}`);
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendAdminOrderNotification(order) {
    const emailContent = `
      New Order Received!
      
      Order ID: ${order._id}
      Order Items: ${this.formatOrderItems(order.items)}
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

    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New Order Received - #${order._id}`,
      text: emailContent
    });
  }

  async sendContactEmail(contactData) {
    const { name, email, subject, message } = contactData;

    // Send to admin
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `Contact Form: ${subject}`,
      text: `From: ${name}\nEmail: ${email}\nMessage: ${message}`
    });

    // Send confirmation to user
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Thank you for contacting Kyoso Cards',
      text: `Dear ${name},\n\nThank you for your message. We'll get back to you soon.\n\nBest regards,\nKyoso Cards Team`
    });
  }

  async sendOrderConfirmation(order, driveLink) {
    const email = order.isGuestOrder ? order.guestEmail : order.user.email;
    
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Order Confirmation - #${order._id}`,
      text: `
      Order ID: ${order._id}
      Total Amount: $${order.totalAmount}
      
      The order files will be available at: ${driveLink}
      `
    });
  }

  formatOrderItems(items) {
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
  }
}

module.exports = new EmailService();