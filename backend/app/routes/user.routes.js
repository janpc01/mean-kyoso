const { authJwt } = require('../middlewares');
const controller = require('../controllers/user.controller');

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/api/test/all", (req, res) => {
        res.status(200).send("Public Content.");
    });

    app.get("/api/test/user", [authJwt.verifyToken], (req, res) => {
        res.status(200).send("User Content.");
    });
};