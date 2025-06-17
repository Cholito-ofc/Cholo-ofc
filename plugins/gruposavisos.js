global.gruposAvisosCache = [];

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isOwner = global.owner?.some(([id]) => id === senderNum);
  const isFromMe = msg.key.fromMe;

  if (!isOwner && !isFromMe) {
    return conn.sendMessage(chatId, { text: "🚫 *Solo el owner o el bot pueden usar este comando.*" }, { quoted: msg });
  }

  // Consigue el número del bot (solo dígitos)
  const botNumber = (conn.user?.id || conn.user?.jid || "").replace(/[^0-9]/g, "");

  let gruposMeta = Object.values(
    await (conn.groupFetchAllParticipating ? await conn.groupFetchAllParticipating() : {})
  );
  let gruposBotAdmin = [];
  let debugMsg = ""; // Para ver los valores reales

  for (const group of gruposMeta) {
    try {
      const metadata = await conn.groupMetadata(group.id);
      // Busca al bot entre los participantes
      const botParticipant = metadata.participants.find(p =>
        (p.id || "").replace(/[^0-9]/g, "") === botNumber
      );

      // DEPURACIÓN: muestra cómo viene la info de admin
      debugMsg += `[${metadata.subject}] Bot está: ${!!botParticipant}, admin: ${botParticipant?.admin}, isAdmin: ${botParticipant?.isAdmin}\n`;

      // Haz true si el bot es admin según los posibles formatos
      const esAdmin =
        !!botParticipant &&
        (
          botParticipant.admin === "admin" ||
          botParticipant.admin === "superadmin" ||
          botParticipant.isAdmin === true ||
          botParticipant.isAdmin === "true" ||
          botParticipant.admin === true ||
          botParticipant.admin === "true"
        );

      if (esAdmin) {
        gruposBotAdmin.push({ id: group.id, subject: metadata.subject });
      }
      await new Promise(res => setTimeout(res, 100));
    } catch (e) {
      debugMsg += `[${group.id}] Error: ${e.message}\n`;
      continue;
    }
  }

  if (gruposBotAdmin.length === 0) {
    return conn.sendMessage(
      chatId, 
      { text: "❌ *No estoy como admin en ningún grupo.*\n\nDEBUG:\n" + debugMsg }, 
      { quoted: msg }
    );
  }

  global.gruposAvisosCache = gruposBotAdmin;

  let listado = gruposBotAdmin.map((g, i) => `🔢 *${i + 1}.* ${g.subject}`).join('\n');
  let cantidad = gruposBotAdmin.length;

  let mensaje = `
╔══════════════════════╗
      👑 *GRUPOS ADMINISTRADOS* 👑
╚══════════════════════╝

${listado}

━━━━━━━━━━━━━━━━━━━━━━━
📊 *Total de grupos donde soy admin:* ${cantidad}
━━━━━━━━━━━━━━━━━━━━━━━

✨ _¿Quieres mandar un aviso solo a un grupo?_
Usa el comando:
  *.aviso1 <mensaje>* para el primer grupo,
  *.aviso2 <mensaje>* para el segundo, etc.

DEBUG:
${debugMsg}
`;

  conn.sendMessage(chatId, {
    text: mensaje.trim(),
    quoted: msg
  });
};

handler.command = ["gruposavisos"];
handler.tags = ["admin"];
handler.help = ["gruposavisos"];
module.exports = handler;