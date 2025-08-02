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

const porta = process.env.PORT || 3000;
aplicativo.listen(porta, () => {
  console.log(`✅ SharkBotzap rodando na porta ${porta}`);
});
