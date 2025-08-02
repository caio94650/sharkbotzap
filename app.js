const express = require("express");
const session = require("express-session");
const path = require("path");

const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

// Confia no primeiro proxy (necessário para Render.com e HTTPS)
app.set("trust proxy", 1);

// Configurações básicas
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Sessão segura
app.use(
  session({
    secret: "sharkbotzap_secret",
    resave: false,
    saveUninitialized: false, // <- aqui
    cookie: {
      maxAge: 24 * 60 * 60 * 1000 // 1 dia
    }
  })
);

// Rotas
app.use("/", authRoutes);
app.use("/dashboard", dashboardRoutes);

// Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ SharkBotzap rodando na porta ${PORT}`);
});
