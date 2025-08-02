const fs = require("fs");
const path = require("path");
const { makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const contatos = require("./contatos.json");
const mensagens = require("./mensagens.json");

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Arquivo de status
const statusPath = path.join(__dirname, "status.json");

// Função para atualizar o status da sessão
function atualizarStatus(sid, novoStatus, ultimaMsg = "") {
  let dados = {};
  if (fs.existsSync(statusPath)) {
    dados = JSON.parse(fs.readFileSync(statusPath));
  }
  dados[sid] = {
    status: novoStatus,
    lastMessage: ultimaMsg || (dados[sid]?.lastMessage || "Nenhuma mensagem ainda")
  };
  fs.writeFileSync(statusPath, JSON.stringify(dados, null, 2));
}

// Função principal de aquecimento
async function iniciarAquecimento(sessionId) {
  const pastaSessao = path.join(__dirname, "sessions", sessionId);

  const { state, saveCreds } = await useMultiFileAuthState(pastaSessao);
  const sock = makeWASocket({ auth: state });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    if (update.connection === "open") {
      console.log(`✅ Sessão ${sessionId} conectada! Iniciando aquecimento...`);
      atualizarStatus(sessionId, "connected");
      aquecer();
    } else if (update.connection === "connecting") {
      atualizarStatus(sessionId, "connecting");
    } else if (update.connection === "close") {
      atualizarStatus(sessionId, "disconnected");
    }
  });

  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];
    if (!msg.key.fromMe && msg.message?.conversation) {
      const resposta = "Recebido aqui, valeu! 😎";
      await sock.sendMessage(msg.key.remoteJid, { text: resposta });
      console.log(`🤖 Respondeu ${msg.key.remoteJid}: ${resposta}`);
      atualizarStatus(sessionId, "connected", resposta);
    }
  });

  async function aquecer() {
    while (true) {
      for (let numero of contatos) {
        const jid = numero + "@s.whatsapp.net";
        const msg = mensagens[Math.floor(Math.random() * mensagens.length)];
        try {
          await sock.sendMessage(jid, { text: msg });
          console.log(`📤 Enviado para ${numero}: ${msg}`);
          atualizarStatus(sessionId, "connected", msg);
        } catch (e) {
          console.log(`❌ Falha ao enviar para ${numero}`);
        }
        await delay(Math.floor(Math.random() * 60000) + 30000); // intervalo 30–90s
      }
    }
  }
}

// Altere isso para o identificador da sessão do seu usuário logado
const sessionId = process.env.SESSION_ID || "mariana_gmail_com";
iniciarAquecimento(sessionId);