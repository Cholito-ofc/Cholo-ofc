// plugins/avisoN.js
global.gruposAvisosCache = global.gruposAvisosCache || [];

const handler = async (msg, { conn, command, args }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);
  const isFromMe = msg.key.fromMe;

  if (!isOwner && !isFromMe) {
    return conn.sendMessage(chatId, { text: "🚫 *Solo el owner o el bot pueden usar este comando.*" }, { quoted: msg });
  }

  if (!global.gruposAvisosCache.length) {
    return conn.sendMessage(chatId, { text: "⚠️ *Primero usa el comando .gruposavisos para cargar la lista de grupos.*" }, { quoted: msg });
  }

  // Detecta el número del comando (ej: aviso3 => 3)
  const match = command.match(/^aviso(\d+)$/i);
  if (!match) return;
  const idx = parseInt(match[1]) - 1;

  if (idx < 0 || idx >= global.gruposAvisosCache.length) {
    return conn.sendMessage(chatId, { text: "❌ *Número de grupo inválido.*" }, { quoted: msg });
  }

  const texto = args.join(" ");
  if (!texto) {
    return conn.sendMessage(chatId, { text: "⚠️ *Debes escribir el mensaje a enviar.*" }, { quoted: msg });
  }

  const grupo = global.gruposAvisosCache[idx];
  try {
    await conn.sendMessage(grupo.id, { text: texto });
    return conn.sendMessage(chatId, { text: `✅ *Aviso enviado al grupo:* ${grupo.subject}` }, { quoted: msg });
  } catch {
    return conn.sendMessage(chatId, { text: "❌ *No se pudo enviar el aviso. ¿El bot sigue en el grupo?*" }, { quoted: msg });
  }
};

handler.command = /^aviso\d+$/i; // acepta .aviso1, .aviso2, .aviso3, etc.
handler.tags = ["admin"];
handler.help = ["aviso1 <mensaje>", "aviso2 <mensaje>", "aviso3 <mensaje>", "..."];
module.exports = handler;