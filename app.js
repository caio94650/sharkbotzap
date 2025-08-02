const express = require("express");
const session = require("express-session");
const path = require("path");

const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(
  session({
    secret: "sharkbotzap_secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/", authRoutes);
app.use("/dashboard", dashboardRoutes);

app.listen(3000, () => {
  console.log("✅ SharkBotzap rodando em http://localhost:3000");
});