const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./users.db");

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT
  )
`);

exports.showLogin = (req, res) => {
  res.render("login", { error: null, success: null });
};

exports.showRegister = (req, res) => {
  res.render("register");
};

exports.register = (req, res) => {
  const { name, email, password } = req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.send("Erro ao registrar");
    db.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hash], (err) => {
      if (err) return res.send("Erro ao registrar");
      res.redirect("/");
    });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (!user) return res.send("Usuário não encontrado");
    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        req.session.user = user;
        res.redirect("/dashboard");
      } else {
        res.send("Senha incorreta");
      }
    });
  });
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect("/");
};