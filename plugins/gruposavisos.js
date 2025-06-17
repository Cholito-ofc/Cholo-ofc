global.gruposAvisosCache = [];

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isOwner = (global.owner || []).some(([id]) => id === senderNum);
  const isFromMe = msg.key.fromMe;

  if (!isOwner && !isFromMe) {
    return conn.sendMessage(chatId, { text: "🚫 *Solo el owner o el bot pueden usar este comando.*" }, { quoted: msg });
  }

  const botNumber = (conn.user?.id || conn.user?.jid || "").replace(/[^0-9]/g, "");

  // Juntar TODOS los grupos posibles
  let groupJids = [];
  if (conn.chats) {
    groupJids = Object.values(conn.chats)
      .filter(c => c.id && c.id.endsWith("@g.us"))
      .map(c => c.id);
  }
  if (typeof conn.groupFetchAllParticipating === "function") {
    const more = Object.keys(await conn.groupFetchAllParticipating());
    for (const id of more) if (!groupJids.includes(id)) groupJids.push(id);
  }
  groupJids = [...new Set(groupJids)];

  let gruposBotAdmin = [];
  for (const groupId of groupJids) {
    try {
      const metadata = await conn.groupMetadata(groupId);
      const botParticipant = metadata.participants.find(
        p => (p.id || p.jid || "").replace(/[^0-9]/g, "") === botNumber
      );
      const isAdmin =
        botParticipant &&
        (
          botParticipant.admin === "admin" ||
          botParticipant.admin === "superadmin" ||
          botParticipant.admin === true ||
          botParticipant.admin === "true" ||
          botParticipant.isAdmin === true
        );
      if (isAdmin) {
        gruposBotAdmin.push({ id: groupId, subject: metadata.subject });
      }
      await new Promise(res => setTimeout(res, 25));
    } catch (e) {
      continue;
    }
  }

  if (!gruposBotAdmin.length) {
    return conn.sendMessage(chatId, { text: "❌ *No estoy como admin en ningún grupo, o no puedo obtener la info correctamente.*" }, { quoted: msg });
  }

  global.gruposAvisosCache = gruposBotAdmin;

  let listado = gruposBotAdmin.map((g, i) => `*${i + 1}.* ${g.subject}`).join('\n');
  conn.sendMessage(chatId, {
    text: `*Grupos donde soy admin:*\n\n${listado}\n\nUsa *.aviso1 <mensaje>* para avisar al grupo 1, *.aviso2 <mensaje>* al 2, etc.`,
    quoted: msg
  });
};

handler.command = ["gruposavisos"];
handler.tags = ["admin"];
handler.help = ["gruposavisos"];
module.exports = handler;