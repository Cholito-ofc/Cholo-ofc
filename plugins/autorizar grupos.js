// plugins/autorizaciongrupos.js
const fs = require("fs");
const path = require("path");
const file = path.resolve("./grupos_autorizados.json");

function getGruposAutorizados() {
  if (!fs.existsSync(file)) fs.writeFileSync(file, "[]");
  return JSON.parse(fs.readFileSync(file));
}
function setGruposAutorizados(arr) {
  fs.writeFileSync(file, JSON.stringify(arr, null, 2));
}

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);

  if (!isOwner) {
    return conn.sendMessage(chatId, {
      text: "🚫 *Solo el owner puede autorizar grupos.*"
    }, { quoted: msg });
  }

  let grupos = getGruposAutorizados();
  if (!grupos.includes(chatId)) {
    grupos.push(chatId);
    setGruposAutorizados(grupos);
    return conn.sendMessage(chatId, {
      text: "✅ *Este grupo ha sido autorizado. El bot responderá aquí.*"
    }, { quoted: msg });
  } else {
    return conn.sendMessage(chatId, {
      text: "⚠️ *Este grupo ya está autorizado.*"
    }, { quoted: msg });
  }
};

handler.command = ["autorizargrupo"];
handler.tags = ["owner"];
handler.help = ["autorizargrupo"];
module.exports = handler;