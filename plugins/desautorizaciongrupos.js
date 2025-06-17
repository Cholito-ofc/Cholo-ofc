// plugins/desautorizaciongrupos.js
const fs = require("fs");
const path = require("path");
const file = path.resolve("./grupos_autorizados.json");

// Función para obtener la lista de grupos autorizados
function getGruposAutorizados() {
  if (!fs.existsSync(file)) fs.writeFileSync(file, "[]");
  return JSON.parse(fs.readFileSync(file));
}
function setGruposAutorizados(arr) {
  fs.writeFileSync(file, JSON.stringify(arr, null, 2));
}

// FILTRO GLOBAL para que el plugin solo responda en grupos autorizados
const before = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);

  // Si es grupo, no está autorizado y no es el owner, no responde
  if (chatId.endsWith("@g.us") && !isOwner) {
    const grupos = getGruposAutorizados();
    if (!grupos.includes(chatId)) return !0; // Esto evita la ejecución del comando
  }
};

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  if (!chatId.endsWith("@g.us")) return; // Solo en grupos

  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);

  if (!isOwner) {
    return conn.sendMessage(chatId, {
      text: "🚫 *Solo el owner puede quitar la autorización de grupos.*"
    }, { quoted: msg });
  }
  let grupos = getGruposAutorizados();
  if (grupos.includes(chatId)) {
    grupos = grupos.filter(id => id !== chatId);
    setGruposAutorizados(grupos);
    return conn.sendMessage(chatId, {
      text: "❌ *Este grupo ha sido desautorizado. El bot ya no responderá aquí.*"
    }, { quoted: msg });
  } else {
    return conn.sendMessage(chatId, {
      text: "⚠️ *Este grupo no está autorizado.*"
    }, { quoted: msg });
  }
};

handler.before = before;
handler.command = ["desautorizargrupo"];
handler.tags = ["owner"];
handler.help = ["desautorizargrupo"];
module.exports = handler;