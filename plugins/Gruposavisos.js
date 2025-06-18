global.gruposAvisosCache = []

const handler = async (msg, { conn, text}) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);
  const isFromMe = msg.key.fromMe;

  if (!isOwner &&!isFromMe) {
    return conn.sendMessage(chatId, { text: "🚫 *Solo el owner o el bot pueden usar este comando.*"}, { quoted: msg});
}

  if (!text) {
    return conn.sendMessage(chatId, { text: "❗ *Debes escribir el mensaje a enviar.*"}, { quoted: msg});
}

  const botId = (conn.user?.id || conn.user?.jid || "").split(":")[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";
  console.log(`Bot ID: ${botId}`);

  let gruposMeta = Object.values(await conn.groupFetchAllParticipating? await conn.groupFetchAllParticipating(): {});
  let enviados = [];

  for (const group of gruposMeta) {
    try {
      const metadata = await conn.groupMetadata(group.id);
      const isAdmin = metadata.participants.some(p =>
        p.id === botId && (p.admin === "admin" || p.admin === "superadmin")
);
      if (isAdmin) {
        await conn.sendMessage(group.id, { text}, { quoted: msg});
        enviados.push(metadata.subject);
}
} catch (e) {
      console.error(`Error enviando a ${group.id}`, e);
}
}

  let resumen = enviados.length
? `✅ *Mensaje enviado a los siguientes grupos:*\n\n${enviados.map((name, i) => `*${i + 1}.* ${name}`).join("\n")}`
: "⚠️ *No se pudo enviar el mensaje a ningún grupo.*";

  return conn.sendMessage(chatId, { text: resumen}, { quoted: msg});
};

handler.command = ["gruposavisos"];
handler.tags = ["admin"];
handler.help = ["gruposavisos <mensaje>"];
module.exports = handler;