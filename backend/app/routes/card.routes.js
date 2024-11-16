const { authJwt } = require('../middlewares');
const controller = require('../controllers/card.controller');

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, Content-Type, Accept"
        );
        next();
    });

    // Card routes
    app.post(
        "/api/cards",
        [authJwt.verifyToken], // Ensure the user is authenticated
        controller.createCard
    );

    app.put(
        "/api/cards/:cardId",
        [authJwt.verifyToken], // Ensure the user is authenticated
        controller.updateCard
    );

    app.delete(
        "/api/cards/:cardId",
        [authJwt.verifyToken], // Ensure the user is authenticated
        controller.deleteCard
    );

    app.get(
        "/api/cards/user/:userId",
        [authJwt.verifyToken], // Ensure the user is authenticated
        controller.getUserCards
    );
};
