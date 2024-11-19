require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieSession = require('cookie-session');
const dbConfig = require('./app/config/db.config');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

const db = require('./app/models');
const Role = db.role;

// Connect to MongoDB
db.mongoose.connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`)
    .then(() => {
        console.log("Successfully connected to MongoDB.");
        initial();
    })
    .catch((err) => {
        console.error("Connection error", err);
        process.exit();
    });

const corsOptions = {
    origin: "http://localhost:8081",
    credentials: true
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Parse requests of content-type - application/json
app.use(bodyParser.json({ limit: '10mb' }));

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.use(
    cookieSession({
        name: "jwt",
        keys: [process.env.COOKIE_SECRET || "template-cookie-secret"],
        httpOnly: true
    })
);

// Simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to the application." });
});

// Routes
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);
require('./app/routes/card.routes')(app);
require('./app/routes/order.routes')(app);
require('./app/routes/payment.routes')(app);

// Set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

// Initialize roles in the database
async function initial() {
    try {
        const count = await Role.estimatedDocumentCount();

        if (count === 0) {
            await new Role({ name: "user" }).save();
            console.log("added 'user' to roles collection");

            await new Role({ name: "moderator" }).save();
            console.log("added 'moderator' to roles collection");

            await new Role({ name: "admin" }).save();
            console.log("added 'admin' to roles collection");
        }
    } catch (err) {
        console.error("Initialization error", err);
    }
}
