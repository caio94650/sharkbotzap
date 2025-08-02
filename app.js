const express = require("express");
const session = require("express-session");
const path = require("path");

const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

// Configurações básicas
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); // Certifique-se de que a pasta se chama exatamente "public"

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Certifique-se de que a pasta é "views"

app.use(
  session({
    secret: "sharkbotzap_secret",
    resave: false,
    saveUninitialized: true,
  })
);

// Rotas
app.use("/", authRoutes);
app.use("/dashboard", dashboardRoutes); // Agora o painel responde a /dashboard

// Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ SharkBotzap rodando na porta ${PORT}`);
});
