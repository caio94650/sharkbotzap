const express = require("express");
const path = require("path");
const fs = require("fs");
const qrcode = require("qrcode");
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");

const router = express.Router();

// Rota GET - Painel
router.get("/", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const sessionId = req.session.user.email.replace(/[@.]/g, "_");
  const qrPath = path.join(__dirname, "..", "qr", `${sessionId}.txt`);
  let qrCode = null;

  try {
    if (fs.existsSync(qrPath)) {
      qrCode = fs.readFileSync(qrPath, "utf8");
    }
  } catch (err) {
    console.error("Erro ao ler QR Code:", err);
  }

  const statusPath = path.join(__dirname, "..", "status.json");
  let statusData = {};

  try {
    if (fs.existsSync(statusPath)) {
      statusData = JSON.parse(fs.readFileSync(statusPath));
    }
  } catch (err) {
    console.error("Erro ao ler status.json:", err);
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
  try {
    const email = req.session.user?.email;
    if (!email) {
      console.warn("Tentativa de conexão sem sessão ativa.");
      return res.status(401).send("Usuário não autenticado.");
    }

    const sessionId = email.replace(/[@.]/g, "_");
    const sessionDir = path.join(__dirname, "..", "sessions", sessionId);
    const qrFilePath = path.join(__dirname, "..", "qr", `${sessionId}.txt`);
    const statusPath = path.join(__dirname, "..", "status.json");

    console.log("➡️ Iniciando conexão para:", sessionId);
    console.log("📁 Diretório da sessão:", sessionDir);

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false
    });

    sock.ev.on("connection.update", async (update) => {
      const { connection, qr } = update;

      if (qr) {
        console.log("📸 QR Code gerado");
        const qrBase64 = await qrcode.toDataURL(qr);
        fs.writeFileSync(qrFilePath, qrBase64);
      }

      if (connection === "open") {
        console.log("✅ WhatsApp conectado com sucesso:", sessionId);

        if (fs.existsSync(qrFilePath)) fs.unlinkSync(qrFilePath);

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

    sock.ev.on("creds.update", saveCreds);

    res.redirect("/dashboard");
  } catch (err) {
    console.error("❌ Erro ao conectar com o WhatsApp:", err);
    res.status(500).send("Erro interno ao tentar conectar com o WhatsApp.");
  }
});

// ✅ ROTA DE DEBUG TEMPORÁRIA PARA TESTE DE FORMULÁRIO
router.post("/debug", (req, res) => {
  console.log("✅ POST /debug recebido!");
  res.send("Debug OK!");
});

// ✅ Botão do aquecedor
router.post("/aquecedor", (req, res) => {
  res.redirect("/dashboard");
});

// ✅ Botão de DESCONEXÃO do WhatsApp
router.post("/desconectar", (req, res) => {
  try {
    const email = req.session.user?.email;
    if (!email) return res.status(401).send("Usuário não autenticado.");

    const sessionId = email.replace(/[@.]/g, "_");
    const sessionDir = path.join(__dirname, "..", "sessions", sessionId);
    const qrFilePath = path.join(__dirname, "..", "qr", `${sessionId}.txt`);
    const statusPath = path.join(__dirname, "..", "status.json");

    // Deleta pasta da sessão e QR se existirem
    if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true });
    if (fs.existsSync(qrFilePath)) fs.unlinkSync(qrFilePath);

    // Atualiza status para desconectado
    let statusData = fs.existsSync(statusPath)
      ? JSON.parse(fs.readFileSync(statusPath))
      : {};
    statusData[sessionId] = {
      status: "desconectado",
      lastMessage: "-"
    };
    fs.writeFileSync(statusPath, JSON.stringify(statusData, null, 2));

    console.log("🔌 WhatsApp desconectado:", sessionId);

    res.redirect("/dashboard");
  } catch (err) {
    console.error("❌ Erro ao desconectar:", err);
    res.status(500).send("Erro ao desconectar.");
  }
});

module.exports = router;
