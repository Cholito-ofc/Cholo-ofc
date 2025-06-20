const fs = require("fs");
const path = require("path");

// Archivo donde se guardan los estados AFK
const afkPath = path.resolve("./afk_users.json");
let afkData = fs.existsSync(afkPath)
  ? JSON.parse(fs.readFileSync(afkPath, "utf-8"))
  : {};

function saveAfk() {
  fs.writeFileSync(afkPath, JSON.stringify(afkData, null, 2));
}

const handler = async (msg, { conn, args }) => {
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");

  // Toma la razón opcional
  const reason = args.join(" ").trim() || "No especificada";

  afkData[senderNum] = {
    reason,
    since: Date.now()
  };
  saveAfk();

  return conn.sendMessage(
    msg.key.remoteJid,
    { text: `🌙 Ahora estás AFK\n📝 Razón: ${reason}` },
    { quoted: msg }
  );
};

// Checador de mensajes entrantes para avisar si alguien está AFK
handler.before = async (msg, { conn }) => {
  // Ignora si es mensaje del mismo bot
  if (msg.key.fromMe) return;

  // Checa si hay menciones o si responde a un usuario
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  const replyUser = msg.message?.extendedTextMessage?.contextInfo?.participant;
  const chatId = msg.key.remoteJid;

  // Función auxiliar para avisar AFK
  async function notifyAfk(userId) {
    const userNum = userId.replace(/[^0-9]/g, "");
    const afk = afkData[userNum];
    if (afk) {
      const time = ((Date.now() - afk.since) / 1000 / 60).toFixed(1); // min
      await conn.sendMessage(
        chatId,
        { text: `⚠️ Ese usuario está AFK\n📝 Razón: ${afk.reason}\n⏱️ Hace: ${time} min` },
        { quoted: msg }
      );
    }
  }

  // Avisar si se menciona o responde a alguien AFK
  if (mentioned.length) {
    for (const user of mentioned) {
      await notifyAfk(user);
    }
  }
  if (replyUser) {
    await notifyAfk(replyUser);
  }

  // Si el usuario AFK vuelve a hablar, quitarle AFK
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  if (afkData[senderNum]) {
    delete afkData[senderNum];
    saveAfk();
    await conn.sendMessage(
      chatId,
      { text: "👋 Ya no estás AFK. ¡Bienvenido de vuelta!" },
      { quoted: msg }
    );
  }
};

handler.command = ["afk"];
handler.tags = ["tools"];
handler.help = ["afk [razón]"];
module.exports = handler;