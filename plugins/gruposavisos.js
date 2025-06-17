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
    const botJid = conn.user?.id || conn.user?.jid || "";
    const botNumber = botJid.replace(/[^0-9]/g, "");

    // Obtiene todos los grupos donde el bot está
    let gruposData = [];
    if (typeof conn.groupFetchAllParticipating === "function") {
      gruposData = Object.values(await conn.groupFetchAllParticipating());
    } else if (conn.chats) {
      gruposData = Object.values(conn.chats).filter(v => v.id && v.id.endsWith("@g.us"));
    }

    // DEBUG: muestra el número del bot y los grupos encontrados
    let debugMsg = `🟩 *Número del bot:* ${botNumber} (JID: ${botJid})\n🟩 *Grupos detectados:* ${gruposData.length}\n\n`;

    let gruposBotAdmin = [];
    for (const group of gruposData) {
      let groupId = group.id || group.jid || group;
      try {
        const metadata = await conn.groupMetadata(groupId);

        // Lista de IDs de administradores
        let adminIDs = metadata.participants
          .filter(p => p.admin)
          .map(p => (p.id || "").replace(/[^0-9]/g, ""));

        // DEBUG: muestra los admins de cada grupo
        debugMsg += `🔹 *${metadata.subject || "Sin Nombre"}*\n`;
        debugMsg += `  GroupID: ${groupId}\n`;
        debugMsg += `  Admins: [${adminIDs.join(", ")}]\n`;

        if (adminIDs.includes(botNumber)) {
          gruposBotAdmin.push({ id: groupId, subject: metadata.subject || "Sin Nombre" });
          debugMsg += `  ✅ El bot es admin aquí\n\n`;
        } else {
          debugMsg += `  ⛔️ El bot NO es admin aquí\n\n`;
        }

        await new Promise(res => setTimeout(res, 40));
      } catch (e) {
        debugMsg += `  ⚠️ Error al leer metadata: ${e.message}\n\n`;
        continue;
      }
    }

    if (!gruposBotAdmin.length) {
      return conn.sendMessage(chatId, { text: `🚫 El bot NO es admin en ningún grupo.\n\n${debugMsg}` }, { quoted: m });
    }

    // Guarda la lista para otros comandos tipo .avisoN
    global.gruposAvisosCache = gruposBotAdmin;

    // Mensaje personalizado y claro
    let mensaje = [
      "╔═══════════════════════════╗",
      "🤖 *GRUPOS DONDE EL BOT ES ADMIN* 🤖",
      "╚═══════════════════════════╝",
      "",
      gruposBotAdmin.map((g, i) => `*${i + 1}.* ${g.subject}`).join('\n'),
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━",
      `🔢 *Cantidad total:* ${gruposBotAdmin.length}`,
      "━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "💡 *¿Quieres enviar un aviso a un grupo específico?*",
      "Usa el comando:",
      "   *.aviso1 <mensaje>* para el primer grupo,",
      "   *.aviso2 <mensaje>* para el segundo, etc.",
      "",
      "📝 *Si cambiaste de grupo o de admin, ejecuta este comando otra vez.*",
      "",
      "🔬 *Debug info:*",
      debugMsg
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