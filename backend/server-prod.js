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
mongoose.connect(process.env.CUSTOMCONNSTR_COSMOSDB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "kyoso_db"
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
    origin: (origin, callback) => {
        const allowedOrigins = [
            "https://kyosocards.com",
            "https://mango-plant-0d19e2110.4.azurestaticapps.net",
            "https://order-processor-ewexgkcvhnhzbqhc.canadacentral-01.azurewebsites.net"
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept', 'Access-Control-Allow-Headers'],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204
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
const PORT = process.env.PORT;
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
