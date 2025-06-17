// plugins/gruposavisos.js

global.gruposAvisosCache = []

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);
  const isFromMe = msg.key.fromMe;

  if (!isOwner && !isFromMe) {
    return conn.sendMessage(chatId, { text: "🚫 *Solo el owner o el bot pueden usar este comando.*" }, { quoted: msg });
  }

  // Normaliza el número del bot (solo dígitos)
  const botNumber = (conn.user?.id || conn.user?.jid || "").replace(/[^0-9]/g, "");

  let gruposMeta = Object.values(await (conn.groupFetchAllParticipating ? await conn.groupFetchAllParticipating() : {}));
  let gruposBotAdmin = [];
  let debugMsg = '';

  for (const group of gruposMeta) {
    try {
      const metadata = await conn.groupMetadata(group.id);
      // Busca al bot por número, ignora formato de ID
      const botParticipant = metadata.participants.find(p =>
        p.id && p.id.replace(/[^0-9]/g, "") === botNumber
      );
      // DEBUG opcional:
      // debugMsg += `\n[${metadata.subject}] Bot está en el grupo: ${!!botParticipant}, es admin: ${botParticipant?.admin}\n`;
      if (botParticipant && (botParticipant.admin === "admin" || botParticipant.admin === "superadmin")) {
        gruposBotAdmin.push({ id: group.id, subject: metadata.subject });
      }
      await new Promise(res => setTimeout(res, 200)); // pequeña pausa
    } catch (e) {
      // debugMsg += `\n[${group.id}] Error al obtener metadata: ${e.message}\n`;
      continue;
    }
  }

  if (gruposBotAdmin.length === 0) {
    return conn.sendMessage(chatId, { text: "❌ *No estoy como admin en ningún grupo.*" }, { quoted: msg });
    // Si quieres depurar, puedes enviar debugMsg también
    // return conn.sendMessage(chatId, { text: "❌ *No estoy como admin en ningún grupo.*\n\nDEBUG:\n" + debugMsg }, { quoted: msg });
  }

  global.gruposAvisosCache = gruposBotAdmin;

  let listado = gruposBotAdmin.map((g, i) => `🔢 *${i + 1}.* ${g.subject}`).join('\n');
  let cantidad = gruposBotAdmin.length;

  let mensaje = `
👥 *LISTA DE GRUPOS DONDE EL BOT ES ADMINISTRADOR*

${listado}

📊 *Total de grupos donde soy admin:* ${cantidad}

✨ _Para enviar un aviso a un grupo específico, usa el comando:_ 
*.aviso1 <mensaje>* para el primer grupo,
*.aviso2 <mensaje>* para el segundo, etc.
  `;

  conn.sendMessage(chatId, {
    text: mensaje.trim(),
    quoted: msg
  });

  // Si quieres ver el debug, descomenta la siguiente línea:
  // await conn.sendMessage(chatId, { text: "DEBUG:\n" + debugMsg.slice(0, 4096) });
};

handler.command = ["gruposavisos"];
handler.tags = ["admin"];
handler.help = ["gruposavisos"];
module.exports = handler;