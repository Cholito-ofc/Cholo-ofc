// plugins/desautorizargrupo.js
const fs = require("fs");
const path = require("path");
const file = path.resolve("./grupos_autorizados.json");

// Filtro para que solo funcione en grupos y solo el owner pueda usarlo
function getGruposAutorizados() {
  if (!fs.existsSync(file)) fs.writeFileSync(file, "[]");
  return JSON.parse(fs.readFileSync(file));
}
function setGruposAutorizados(arr) {
  fs.writeFileSync(file, JSON.stringify(arr, null, 2));
}

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

// === FILTRO GLOBAL ===
handler.before = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);

  // Solo deja pasar si es privado o el grupo es autorizado o es el owner
  if (chatId.endsWith("@g.us") && !isOwner) {
    const grupos = getGruposAutorizados();
    if (!grupos.includes(chatId)) return !0;
  }
};

handler.command = ["desautorizargrupo"];
handler.tags = ["owner"];
handler.help = ["desautorizargrupo"];
module.exports = handler;