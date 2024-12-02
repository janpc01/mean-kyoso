const controller = require("../controllers/auth.controller");
const verifySignUp = require("../middlewares/verifySignUp");

module.exports = function(app) {
  app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://kyosocards.com");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

  app.post("/api/auth/signup", [verifySignUp.checkDuplicateEmail], controller.signup);
  app.post("/api/auth/signin", controller.signin);
  app.post("/api/auth/signout", controller.signout);
  app.get("/api/auth/verify", controller.verify);
};
