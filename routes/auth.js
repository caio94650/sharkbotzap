const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// Caminho para o banco de dados (arquivo JSON)
const usersFile = path.join(__dirname, "..", "users.json");

// Garante que o arquivo existe
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, "[]");
}

// Redirecionar "/" para "/login"
router.get("/", (req, res) => {
  res.redirect("/login");
});

// Página de login
router.get("/login", (req, res) => {
  res.render("login", { error: null });
});

// Processar login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const users = JSON.parse(fs.readFileSync(usersFile));

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.render("login", { error: "E-mail ou senha inválidos." });
  }

  req.session.user = user;
  res.redirect("/dashboard");
});

// Página de cadastro
router.get("/register", (req, res) => {
  res.render("register", { error: null, success: null });
});

// Processar cadastro
router.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  const users = JSON.parse(fs.readFileSync(usersFile));

  const alreadyExists = users.find(u => u.email === email);
  if (alreadyExists) {
    return res.render("register", { error: "Este e-mail já está cadastrado.", success: null });
  }

  const newUser = { name, email, password };
  users.push(newUser);
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

  res.render("register", { error: null, success: "Cadastro realizado com sucesso! Faça login agora." });
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;
