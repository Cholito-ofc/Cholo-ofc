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

  const botId = (conn.user?.id || conn.user?.jid || "").split(":")[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  let gruposMeta = Object.values(await conn.groupFetchAllParticipating ? await conn.groupFetchAllParticipating() : {});
  let gruposBotAdmin = [];

  for (const group of gruposMeta) {
    try {
      const metadata = await conn.groupMetadata(group.id);
      const isAdmin = metadata.participants.some(p => 
        p.id.replace(/[^0-9]/g, "") === botId.replace(/[^0-9]/g, "") && (p.admin === "admin" || p.admin === "superadmin")
      );
      if (isAdmin) {
        gruposBotAdmin.push({ id: group.id, subject: metadata.subject });
      }
    } catch (e) { continue; }
  }

  if (gruposBotAdmin.length === 0) {
    return conn.sendMessage(chatId, { text: "❌ *No estoy como admin en ningún grupo, o no puedo obtener la info correctamente.*" }, { quoted: msg });
  }

  global.gruposAvisosCache = gruposBotAdmin;

  let listado = gruposBotAdmin.map((g, i) => `*${i + 1}.* ${g.subject}`).join('\n');
  conn.sendMessage(chatId, {
    text: `*Grupos donde soy admin:*\n\n${listado}\n\nUsa *.aviso1 <mensaje o multimedia>* para avisar al grupo 1, *.aviso2* al 2, etc.\nPuedes responder a una imagen, sticker, audio, documento, etc.`,
    quoted: msg
  });
};

handler.command = ["gruposavisos"];
handler.tags = ["admin"];
handler.help = ["gruposavisos"];
module.exports = handler;