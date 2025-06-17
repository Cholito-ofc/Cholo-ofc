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

  // Consigue el número del bot en formato solo dígitos
  const botNumber = (conn.user?.id || conn.user?.jid || "").replace(/[^0-9]/g, "");

  // Obtén todos los grupos donde el bot está (usando groupFetchAllParticipating si existe, si no, intenta con groupMetadata)
  let gruposMeta = [];
  if (typeof conn.groupFetchAllParticipating === "function") {
    gruposMeta = Object.values(await conn.groupFetchAllParticipating());
  } else if (conn.chats) {
    // Respaldo para algunos forks antiguos
    gruposMeta = Object.values(conn.chats).filter(v => v.id && v.id.endsWith("@g.us"));
  }

  let gruposBotAdmin = [];
  for (const group of gruposMeta) {
    let groupId = group.id || group.jid || group;
    try {
      const metadata = await conn.groupMetadata(groupId);
      // La lista de administradores siempre existe
      const adminNumbers = metadata.participants
        .filter(p => p.admin)
        .map(p => (p.id || "").replace(/[^0-9]/g, ""));
      // Si el bot está en los admins, lo agregamos
      if (adminNumbers.includes(botNumber)) {
        gruposBotAdmin.push({ id: groupId, subject: metadata.subject || "Grupo sin nombre" });
      }
      await new Promise(res => setTimeout(res, 50)); // Pequeña pausa
    } catch (e) {
      // Si hay error sigue con el siguiente grupo
      continue;
    }
  }

  if (!gruposBotAdmin.length) {
    return conn.sendMessage(chatId, { text: "❌ *No estoy como admin en ningún grupo.*" }, { quoted: msg });
  }

  // Guarda la lista para otros comandos
  global.gruposAvisosCache = gruposBotAdmin;

  let texto = [
    "╔══════════════════════╗",
    "      👑 *GRUPOS ADMINISTRADOS* 👑",
    "╚══════════════════════╝",
    "",
    gruposBotAdmin.map((g, i) => `🔢 *${i + 1}.* ${g.subject}`).join('\n'),
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━",
    `📊 *Total de grupos donde soy admin:* ${gruposBotAdmin.length}`,
    "━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "✨ _¿Quieres mandar un aviso solo a un grupo?_",
    "Usa el comando:",
    "  *.aviso1 <mensaje>* para el primer grupo,",
    "  *.aviso2 <mensaje>* para el segundo, etc."
  ].join('\n');

  return conn.sendMessage(chatId, { text: texto.trim(), quoted: msg });
};

handler.command = ["gruposavisos"];
handler.tags = ["admin"];
handler.help = ["gruposavisos"];
module.exports = handler;