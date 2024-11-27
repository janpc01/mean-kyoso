const emailService = require("../services/email.service");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/email/contact", async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).send({ message: "All fields are required" });
    }

    try {
      await emailService.sendContactEmail({ name, email, subject, message });
      res.send({ message: "Your message has been sent successfully!" });
    } catch (error) {
      res.status(500).send({ 
        message: "Failed to send message. Please try again later.",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
};