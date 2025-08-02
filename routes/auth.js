const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// Caminho completo do arquivo de usuários
const usersFile = path.join(__dirname, "..", "users.db");

// Se o arquivo não existir, cria com conteúdo []
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, "[]", "utf8");
}

// Página inicial redireciona para login
router.get("/", (req, res) => {
  res.redirect("/login");
});

// Página de login
router.get("/login", (req, res) => {
  const success = req.query.success ? "Conta criada com sucesso!" : null;
  res.render("login", { error: null, success });
});

// Processar login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  let users = [];

  try {
    const data = fs.readFileSync(usersFile, "utf8");
    users = JSON.parse(data);
  } catch (err) {
    return res.render("login", { error: "Erro ao ler os dados dos usuários.", success: null });
  }

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.render("login", { error: "E-mail ou senha inválidos.", success: null });
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
  let users = [];

  try {
    const data = fs.readFileSync(usersFile, "utf8");
    users = JSON.parse(data);
  } catch (err) {
    users = [];
  }

  const alreadyExists = users.find(u => u.email === email);

  if (alreadyExists) {
    return res.render("register", {
      error: "Este e-mail já está cadastrado.",
      success: null,
    });
  }

  const newUser = { name, email, password };
  users.push(newUser);

  try {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), "utf8");
  } catch (err) {
    return res.render("register", {
      error: "Erro ao salvar o usuário.",
      success: null,
    });
  }

  // ✅ Redireciona para login com mensagem de sucesso
  res.redirect("/login?success=1");
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;
