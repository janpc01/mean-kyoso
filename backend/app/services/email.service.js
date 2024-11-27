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

  // Generic email sending method
  async sendEmail(to, subject, text) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
      });
    } catch (error) {
      throw error;
    }
  }

  // Contact form emails
  async sendContactEmail(contactData) {
    const { name, email, subject, message } = contactData;

    // Send to admin
    await this.sendEmail(
      process.env.ADMIN_EMAIL,
      `Contact Form: ${subject}`,
      `From: ${name}\nEmail: ${email}\nMessage: ${message}`
    );

    // Send confirmation to user
    await this.sendEmail(
      email,
      'Thank you for contacting Kyoso Cards',
      `Dear ${name},\n\nThank you for your message. We'll get back to you soon.\n\nBest regards,\nKyoso Cards Team`
    );
  }

  // Order related emails
  async sendOrderConfirmation(order) {
    const orderItems = this.formatOrderItems(order.items);
    const shippingAddress = this.formatShippingAddress(order.shippingAddress);
    
    await this.sendEmail(
        order.shippingAddress.email,
        `Order Confirmation - #${order._id}`,
        `
        Thank you for your order!

        Order ID: ${order._id}
        Total Amount: $${order.totalAmount}

        Items Ordered:
        ${orderItems}

        Shipping To:
        ${shippingAddress}
        
        Best regards,
        Kyoso Cards Team
        `
    );
  }

  // Helper methods
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

  formatShippingAddress(address) {
    return `
      Name: ${address.fullName}
      Address: ${address.addressLine1}
      ${address.addressLine2 ? address.addressLine2 + '\n' : ''}
      City: ${address.city}
      State/Province: ${address.state}
      Postal Code: ${address.postalCode}
      Country: ${address.country}
      Phone: ${address.phone}
    `;
  }
}

module.exports = new EmailService();