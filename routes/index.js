const express = require("express");
const app = express();
const { createUser, loginUser } = require("../controllers/userControllers.js");
const { validateUserRegistration } = require("../middlewares/vaildate.js");


app.post("/create",validateUserRegistration ,createUser);



app.get("/login", (req, res) => {
  res.render("login", {
    title: "Login",
    user: req.user || null,
    error: null,
  });
});

app.get("/signup", (req, res) => {
  res.render("signup", {
    title: "Signup",
    user: req.user || null,
    error: null,
  });
});
app.post("/login", loginUser);


module.exports = app;
