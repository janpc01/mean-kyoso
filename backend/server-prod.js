const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
require('dotenv').config();

const app = express();
const db = require('./app/models');
const Role = db.role;

// --- 1. MongoDB Connection ---
mongoose
    .connect(process.env.CUSTOMCONNSTR_COSMOSDB_CONNECTION_STRING, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: "kyoso_db"
    })
    .then(() => {
        console.log("Successfully connected to Azure Cosmos DB.");
        initializeRoles();
    })
    .catch((err) => {
        console.error("Connection error", err);
        process.exit(1);
    });

// --- 2. Global CORS Configuration ---
const allowedOrigins = [
    "https://kyosocards.com",
    "https://www.kyosocards.com",
    "https://mango-plant-0d19e2110.4.azurestaticapps.net",
    "https://blue-cliff-0a661b310.4.azurestaticapps.net",
    "https://order-processor-ewexgkcvhnhzbqhc.canadacentral-01.azurewebsites.net",
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) callback(null, true);
        else callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Set-Cookie']
}));

// --- 3. Middleware Setup ---
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

app.use(cookieSession({
    name: "jwt",
    keys: [process.env.COOKIE_SECRET || "template-cookie-secret"],
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Secure cookies in production
    sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// --- 4. Routes ---
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);
require('./app/routes/card.routes')(app);
require('./app/routes/order.routes')(app);
require('./app/routes/payment.routes')(app);
require('./app/routes/email.routes')(app);

// --- 5. Health Check ---
app.get("/", (req, res) => res.json({ message: "Welcome to the application." }));

// --- 6. Start Server ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}.`));

// --- 7. Role Initialization ---
async function initializeRoles() {
    try {
        const count = await Role.estimatedDocumentCount();
        if (count === 0) {
            await Promise.all([
                new Role({ name: "user" }).save(),
                new Role({ name: "moderator" }).save(),
                new Role({ name: "admin" }).save()
            ]);
            console.log("Initialized roles collection.");
        }
    } catch (err) {
        console.error("Error initializing roles:", err);
    }
}
