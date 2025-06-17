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

  let gruposMeta = Object.values(await conn.groupFetchAllParticipating ? await conn.groupFetchAllParticipating() : {});
  let enviados = 0;

  // OBTÉN EL FORMATO DE ID DEL BOT
  const botId = (conn.user?.id || conn.user?.jid || "").split(":")[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";
  //console.log("ID del bot que busco como admin:", botId);

  for (const group of gruposMeta) {
    try {
      const metadata = await conn.groupMetadata(group.id);
      // BUSCA AL BOT ENTRE LOS PARTICIPANTES DEL GRUPO
      const botParticipant = metadata.participants.find(p =>
        (p.id === botId || p.id === conn.user.id || p.id === conn.user.jid) && (p.admin === "admin" || p.admin === "superadmin")
      );
      // DEBUG opcional:
      //console.log("Analizando grupo:", group.subject, group.id);
      //console.log("Bot está como:", botParticipant);

      if (botParticipant) {
        await conn.sendMessage(group.id, { text: `*AVISO:*\n${aviso}` });
        enviados++;
        await new Promise(resolve => setTimeout(resolve, 1200));
      }
    } catch (e) {
      //console.log("Error en grupo:", group.id, e);
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