const express = require("express");
const session = require("express-session");
const path = require("path");

onst authRoutes = require('./routes/auth');
const dashboardRoutes = require("./rotas/dashboard");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("público"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "visualizações")); // <- ESSENCIAL na Render!

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
