// plugins/gruposavisos.js
global.gruposAvisosCache = []

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);
  const isFromMe = msg.key.fromMe;

  if (!isOwner && !isFromMe) {
    return conn.sendMessage(chatId, { text: "🚫 *Solo el owner o el bot pueden usar este comando.*" }, { quoted: msg });
  }

  // --- NUEVO MÉTODO PARA LEER TODOS LOS GRUPOS ---
  let chats = Object.values(conn.chats || {});
  let grupos = chats.filter(c => c.id && c.id.endsWith("@g.us"));

  // Si quieres solo los grupos donde el bot es admin, debes verificar con groupMetadata
  let gruposBotAdmin = [];
  for (const group of grupos) {
    try {
      const metadata = await conn.groupMetadata(group.id);
      // Si quieres mostrar todos, comenta la siguiente línea:
      // const isAdmin = metadata.participants.some(p => p.id === (conn.user?.id || conn.user?.jid) && (p.admin === "admin" || p.admin === "superadmin"));
      // if (!isAdmin) continue;
      gruposBotAdmin.push({ id: group.id, subject: metadata.subject });
    } catch (e) { continue; }
  }

  if (gruposBotAdmin.length === 0) {
    return conn.sendMessage(chatId, { text: "❌ *No estoy en ningún grupo o no puedo obtener la info correctamente.*" }, { quoted: msg });
  }

  global.gruposAvisosCache = gruposBotAdmin;

  let listado = gruposBotAdmin.map((g, i) => `*${i + 1}.* ${g.subject}`).join('\n');
  conn.sendMessage(chatId, {
    text: `*Grupos donde estoy:*\n\n${listado}\n\nUsa *.aviso1 <mensaje o multimedia>* para avisar al grupo 1, *.aviso2* al 2, etc.\nPuedes responder a una imagen, sticker, audio, documento, etc.`,
    quoted: msg
  });
};

handler.command = ["gruposavisos"];
handler.tags = ["admin"];
handler.help = ["gruposavisos"];
module.exports = handler;