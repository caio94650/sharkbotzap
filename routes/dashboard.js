const express = require("express");
const path = require("path");
const fs = require("fs");

const router = express.Router();

router.get("/", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const sessionId = req.session.user.email.replace(/[@.]/g, "_");

  const qrPath = path.join(__dirname, "..", "qr", `${sessionId}.txt`);
  let qrCode = null;
  if (fs.existsSync(qrPath)) {
    qrCode = fs.readFileSync(qrPath, "utf8");
  }

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
  // Ação do botão de aquecimento (futuro)
  res.redirect("/dashboard");
});

module.exports = router;
