// plugins/gruposavisos.js

global.gruposAvisosCache = [];

const handler = async (msg, { conn }) => {
  try {
    const chatId = msg.key.remoteJid;
    const senderId = msg.key.participant || msg.key.remoteJid;
    const senderNum = senderId.replace(/[^0-9]/g, "");
    const isOwner = (global.owner || []).some(([id]) => id === senderNum);
    const isFromMe = msg.key.fromMe;

    if (!isOwner && !isFromMe) {
      return conn.sendMessage(chatId, { text: "🚫 *Solo el owner o el bot pueden usar este comando.*" }, { quoted: msg });
    }

    // Obtén el número del bot (solo dígitos)
    const botNumber = (conn.user?.id || conn.user?.jid || "").replace(/[^0-9]/g, "");

    // Junta TODOS los grupos conocidos, chat activos y groupFetchAllParticipating
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

    // Quita duplicados
    groupJids = [...new Set(groupJids)];

    let gruposBotAdmin = [];

    for (const groupId of groupJids) {
      try {
        const metadata = await conn.groupMetadata(groupId);
        // Busca el número del bot en la lista de participantes y si es admin (cubre todos los formatos)
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
        await new Promise(res => setTimeout(res, 30)); // Pausa para evitar bloqueo
      } catch (e) {
        continue;
      }
    }

    if (!gruposBotAdmin.length) {
      return conn.sendMessage(chatId, { text: "❌ *No estoy como admin en ningún grupo, o no puedo obtener la info correctamente.*\n\nSi acabas de agregarme o dar admin, escribe algún mensaje en el grupo y vuelve a intentarlo." }, { quoted: msg });
    }

    global.gruposAvisosCache = gruposBotAdmin;

    let listado = gruposBotAdmin.map((g, i) => `*${i + 1}.* ${g.subject}`).join('\n');
    conn.sendMessage(chatId, {
      text: `*Grupos donde soy admin:*\n\n${listado}\n\nUsa *.aviso1 <mensaje>* para avisar al grupo 1, *.aviso2 <mensaje>* al 2, etc.`,
      quoted: msg
    });
  } catch (err) {
    return conn.sendMessage(msg.key.remoteJid, { text: "❗ Error interno. Intenta de nuevo. Si sigue el error, escribe algo en cada grupo donde el bot es admin y repite el comando." }, { quoted: msg });
  }
};

handler.command = ["gruposavisos"];
handler.tags = ["admin"];
handler.help = ["gruposavisos"];
module.exports = handler;