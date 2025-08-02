const express = require("express");
const path = require("path");
const fs = require("fs");
const qrcode = require("qrcode");
const { default: makeWASocket, useSingleFileAuthState } = require("@whiskeysockets/baileys");

const router = express.Router();

// Rota GET - Painel
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

// Rota POST - Conectar WhatsApp
router.post("/conectar", async (req, res) => {
  const email = req.session.user?.email;
  if (!email) return res.status(401).send("Usuário não autenticado.");

  const sessionId = email.replace(/[@.]/g, "_");
  const sessionFile = path.join(__dirname, "..", "sessions", `${sessionId}.json`);
  const qrFilePath = path.join(__dirname, "..", "qr", `${sessionId}.txt`);
  const statusPath = path.join(__dirname, "..", "status.json");

  const { state, saveState } = useSingleFileAuthState(sessionFile);

  try {
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false
    });

    sock.ev.on("connection.update", async (update) => {
      const { connection, qr } = update;

      if (qr) {
        const qrBase64 = await qrcode.toDataURL(qr);
        fs.writeFileSync(qrFilePath, qrBase64);
      }

      if (connection === "open") {
        console.log("✅ Conectado:", sessionId);
        if (fs.existsSync(qrFilePath)) fs.unlinkSync(qrFilePath);

        // Atualiza o status
        let statusData = {};
        if (fs.existsSync(statusPath)) {
          statusData = JSON.parse(fs.readFileSync(statusPath));
        }

        statusData[sessionId] = {
          status: "conectado",
          lastMessage: "-"
        };

        fs.writeFileSync(statusPath, JSON.stringify(statusData, null, 2));
      }
    });

    sock.ev.on("creds.update", saveState);

    res.redirect("/dashboard");
  } catch (err) {
    console.error("Erro ao conectar:", err);
    res.status(500).send("Erro ao conectar com o WhatsApp.");
  }
});

// Futuro: botão de aquecimento
router.post("/aquecedor", (req, res) => {
  res.redirect("/dashboard");
});

module.exports = router;
