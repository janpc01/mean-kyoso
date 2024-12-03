require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieSession = require('cookie-session');
const dbConfig = require('./app/config/db.config');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();

const db = require('./app/models');
const Role = db.role;

// Connect to MongoDB
mongoose.connect("mongodb://kyoso-db:CpZ0svqG8rrveYGMuJxI8KldLzHg5evj0QGGZARkA6seberWJDztXRnHFaEp8RDx3bvpPOdiXQCmACDbu2QACg%3D%3D@kyoso-db.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@kyoso-db@", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("Successfully connected to Azure Cosmos DB.");
    initial();
})
.catch((err) => {
    console.error("Connection error", err);
    process.exit();
});

const corsOptions = {
    origin: ["https://kyosocards.com", "https://mango-plant-0d19e2110.4.azurestaticapps.net", "order-processor-ewexgkcvhnhzbqhc.canadacentral-01.azurewebsites.net"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie']
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Parse requests
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Session configuration
app.use(
    cookieSession({
        name: "jwt",
        keys: [process.env.COOKIE_SECRET || "template-cookie-secret"],
        httpOnly: true,
        secure: true,  // for HTTPS
        sameSite: 'none',  // important for cross-site cookies
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
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
require('./app/routes/email.routes')(app);

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
