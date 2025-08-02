const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();

router.get("/", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const sessionId = req.session.user.email.replace(/[@.]/g, "_");

  // Carregar o QR Code salvo (se existir)
  const qrPath = path.join(__dirname, "..", "qr", `${sessionId}.txt`);
  let qrCode = null;
  if (fs.existsSync(qrPath)) {
    qrCode = fs.readFileSync(qrPath, "utf8");
  }

  // Ler o status.json e pegar status da sessão
  const statusPath = path.join(__dirname, "..", "status.json");
  let statusData = {};
  if (fs.existsSync(statusPath)) {
    statusData = JSON.parse(fs.readFileSync(statusPath));
  }

  const currentStatus = statusData[sessionId] || {
    status: "desconhecido",
    lastMessage: "-"
  };

  res.render("dashboard", {
    user: req.session.user,
    qr: qrCode,
    status: currentStatus
  });
});

router.post("/aquecedor", (req, res) => {
  // Esse botão só aciona visualmente por enquanto
  // Pode acionar um sistema real de controle em breve
  res.redirect("/dashboard");
});

module.exports = router;