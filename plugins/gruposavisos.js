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

  // Número del bot (solo dígitos)
  const botNumber = (conn.user?.id || conn.user?.jid || "").replace(/[^0-9]/g, "");

  // Obtiene todos los grupos donde el bot está
  let gruposMeta = Object.values(
    await (conn.groupFetchAllParticipating ? await conn.groupFetchAllParticipating() : {})
  );
  let gruposBotAdmin = [];

  for (const group of gruposMeta) {
    try {
      const metadata = await conn.groupMetadata(group.id);

      // Obtiene la lista de administradores (siempre existe)
      let adminIDs = metadata.participants
        .filter(p => p.admin)
        .map(p => (p.id || "").replace(/[^0-9]/g, ""));
      
      // Si el bot está en la lista de admins, lo agrega
      if (adminIDs.includes(botNumber)) {
        gruposBotAdmin.push({ id: group.id, subject: metadata.subject });
      }

      await new Promise(res => setTimeout(res, 50)); // Pequeña pausa
    } catch (e) {
      continue;
    }
  }

  if (gruposBotAdmin.length === 0) {
    return conn.sendMessage(
      chatId, 
      { text: "❌ *No estoy como admin en ningún grupo.*" }, 
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