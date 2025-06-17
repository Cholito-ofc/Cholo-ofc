const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);
  const isFromMe = msg.key.fromMe;

  // Solo owner o el bot pueden usar este comando
  if (!isOwner && !isFromMe) {
    return conn.sendMessage(chatId, {
      text: "🚫 *Solo el owner o el mismo bot pueden usar este comando.*"
    }, { quoted: msg });
  }

  const aviso = args.join(" ").trim();
  if (!aviso) {
    return conn.sendMessage(chatId, {
      text: "⚠️ *Escribe el mensaje del aviso.*\n\nEjemplo:\n.avisos Este es un aviso importante"
    }, { quoted: msg });
  }

  // Obtener todos los grupos donde el bot está
  let grupos = Object.values(await conn.groupFetchAllParticipating ? await conn.groupFetchAllParticipating() : {});
  let enviados = 0;

  for (const group of grupos) {
    try {
      // Revisar si el bot es admin en el grupo
      const metadata = await conn.groupMetadata(group.id);
      const botParticipant = metadata.participants.find(p => 
        (p.id === conn.user?.id || p.id === conn.user?.jid) && (p.admin === "admin" || p.admin === "superadmin")
      );
      if (botParticipant) {
        await conn.sendMessage(group.id, { text: `*AVISO:*\n${aviso}` });
        enviados++;
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    } catch (e) {
      // Si falla en un grupo, ignora y sigue
      continue;
    }
  }

  return conn.sendMessage(chatId, {
    text: `✅ *Aviso enviado a ${enviados} grupo(s) donde el bot es administrador.*`,
    quoted: msg
  });
};

handler.command = ["avisos"];
handler.tags = ["admin"];
handler.help = ["avisos <mensaje>"];
module.exports = handler;