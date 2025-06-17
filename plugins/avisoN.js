// Esto soporta .aviso1, .aviso2, ... hasta .aviso99
const handler = async (msg, { conn, args, command }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);
  const isFromMe = msg.key.fromMe;

  if (!isOwner && !isFromMe) {
    return conn.sendMessage(chatId, { text: "🚫 *Solo el owner o el bot pueden usar este comando.*" }, { quoted: msg });
  }

  if (!global.gruposAvisosCache || global.gruposAvisosCache.length === 0) {
    return conn.sendMessage(chatId, { text: "⚠️ *Primero usa el comando .gruposavisos para actualizar la lista de grupos.*" }, { quoted: msg });
  }

  const aviso = args.join(" ").trim();
  if (!aviso) {
    return conn.sendMessage(chatId, {
      text: "⚠️ *Escribe el mensaje del aviso.*\n\nEjemplo:\n.aviso1 Este es un aviso para el grupo 1",
      quoted: msg
    });
  }

  const num = parseInt(command.replace("aviso", "")) - 1;
  if (isNaN(num) || !global.gruposAvisosCache[num]) {
    return conn.sendMessage(chatId, {
      text: "❌ *Número de grupo inválido. Usa .gruposavisos para ver la lista.*",
      quoted: msg
    });
  }

  const grupo = global.gruposAvisosCache[num];
  await conn.sendMessage(grupo.id, { text: `*AVISO:*\n${aviso}` });
  return conn.sendMessage(chatId, { text: `✅ *Aviso enviado al grupo:* ${grupo.subject}`, quoted: msg });
};

// Registra los comandos .aviso1, .aviso2, ... .aviso99
handler.command = Array.from({length: 99}, (_,i) => `aviso${i+1}`);
handler.tags = ["admin"];
handler.help = ["aviso1 <mensaje>", "aviso2 <mensaje>", "..."];
module.exports = handler;