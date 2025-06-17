global.gruposAvisosCache = [];

const handler = async (m, { conn }) => {
  try {
    const chatId = m.key.remoteJid;
    const senderId = m.key.participant || m.key.remoteJid;
    const senderNum = senderId.replace(/[^0-9]/g, "");
    const isOwner = (global.owner || []).some(([id]) => id === senderNum);
    const isFromMe = m.key.fromMe;

    if (!isOwner && !isFromMe) {
      return conn.sendMessage(chatId, { text: "❌ Solo el owner o el bot pueden usar este comando." }, { quoted: m });
    }

    // Número del bot (solo dígitos)
    const botNumber = (conn.user?.id || conn.user?.jid || "").replace(/[^0-9]/g, "");

    // Obtiene todos los grupos donde el bot está
    let gruposData = [];
    if (typeof conn.groupFetchAllParticipating === "function") {
      gruposData = Object.values(await conn.groupFetchAllParticipating());
    } else if (conn.chats) {
      gruposData = Object.values(conn.chats).filter(v => v.id && v.id.endsWith("@g.us"));
    }

    let gruposBotAdmin = [];
    for (const group of gruposData) {
      let groupId = group.id || group.jid || group;
      try {
        const metadata = await conn.groupMetadata(groupId);
        // Busca la lista de administradores (siempre existe)
        let adminList = metadata.participants.filter(p => p.admin).map(p => (p.id || "").replace(/[^0-9]/g, ""));
        if (adminList.includes(botNumber)) {
          gruposBotAdmin.push({ id: groupId, subject: metadata.subject || "Sin Nombre" });
        }
        await new Promise(res => setTimeout(res, 40)); // Pausa pequeña
      } catch (e) { continue; }
    }

    if (!gruposBotAdmin.length) {
      return conn.sendMessage(chatId, { text: "🚫 El bot NO es admin en ningún grupo." }, { quoted: m });
    }

    // Guarda la lista para otros comandos
    global.gruposAvisosCache = gruposBotAdmin;

    // Mensaje personalizado y atractivo
    let mensaje = [
      "╔═══════════════════════════╗",
      "    🤖 *GRUPOS DONDE EL BOT ES ADMIN* 🤖",
      "╚═══════════════════════════╝",
      "",
      gruposBotAdmin.map((g, i) => `*${i + 1}.* ${g.subject}`).join('\n'),
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━",
      `🔢 *Cantidad total:* ${gruposBotAdmin.length}`,
      "━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "💡 *¿Deseas enviar un aviso a un grupo específico?*",
      "Usa el comando:",
      "   *.aviso1 <mensaje>* para el primer grupo,",
      "   *.aviso2 <mensaje>* para el segundo,",
      "   y así sucesivamente.",
      "",
      "📝 *Consejo:* Si cambiaste de grupo o de admin, ejecuta este comando otra vez."
    ].join('\n');

    return conn.sendMessage(chatId, { text: mensaje.trim(), quoted: m });

  } catch (err) {
    return conn.sendMessage(m.key.remoteJid, { text: "❗ Error interno al listar los grupos. Intenta de nuevo." }, { quoted: m });
  }
};

handler.command = ["gruposavisos"];
handler.tags = ["admin"];
handler.help = ["gruposavisos"];
module.exports = handler;