const express = require("express");
const session = require("express-session");
const path = require("path");

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); // cuidado: "público" deve ser "public" se for o nome da pasta real

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // troque "visualizações" por "views" se for o nome da pasta real

app.use(
  session({
    secret: "sharkbotzap_secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/", authRoutes);
app.use("/painel", dashboardRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ SharkBotzap rodando na porta ${PORT}`);
});
