const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
let sock = null;
let qrCodeBase64 = null;

async function iniciarWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");
  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, qr, lastDisconnect } = update;

    if (qr) {
      const qrImage = require("qrcode");
      qrImage.toDataURL(qr, (err, url) => {
        qrCodeBase64 = url;
      });
    }

    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        iniciarWhatsApp();
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);
}

function getStatus() {
  return sock?.user ? { status: "conectado" } : { status: "desconhecido" };
}

function getQRCode() {
  return qrCodeBase64;
}

function desconectar() {
  if (sock) sock.logout();
}

module.exports = { iniciarWhatsApp, getStatus, getQRCode, desconectar };
