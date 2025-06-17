// plugins/gruposavisos.js

global.gruposAvisosCache = [] // Para que otros comandos accedan

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);
  const isFromMe = msg.key.fromMe;

  if (!isOwner && !isFromMe) {
    return conn.sendMessage(chatId, { text: "🚫 *Solo el owner o el bot pueden usar este comando.*" }, { quoted: msg });
  }

  // Obtiene el ID del bot (sólo número)
  const botNumber = (conn.user?.id || conn.user?.jid || "").replace(/[^0-9]/g, "");

  let gruposMeta = Object.values(await conn.groupFetchAllParticipating ? await conn.groupFetchAllParticipating() : {});
  let gruposBotAdmin = [];
  let debugMsg = '';

  for (const group of gruposMeta) {
    try {
      const metadata = await conn.groupMetadata(group.id);
      // Busca al bot por número, ignora formato de ID
      const botParticipant = metadata.participants.find(p =>
        p.id && p.id.replace(/[^0-9]/g, "") === botNumber
      );
      // DEBUG: muestra si el bot está y si es admin
      debugMsg += `\n[${metadata.subject}] Bot está en el grupo: ${!!botParticipant}, es admin: ${botParticipant?.admin}\n`;
      if (botParticipant && (botParticipant.admin === "admin" || botParticipant.admin === "superadmin")) {
        gruposBotAdmin.push({ id: group.id, subject: metadata.subject });
      }
      await new Promise(res => setTimeout(res, 300)); // Evita sobrecarga si tienes muchos grupos
    } catch (e) {
      debugMsg += `\n[${group.id}] Error al obtener metadata: ${e.message}\n`;
      continue;
    }
  }

  if (gruposBotAdmin.length === 0) {
    // Si quieres ver el debug, descomenta la siguiente línea
    // return conn.sendMessage(chatId, { text: "❌ *No estoy como admin en ningún grupo.*\n\nDEBUG:\n" + debugMsg }, { quoted: msg });
    return conn.sendMessage(chatId, { text: "❌ *No estoy como admin en ningún grupo.*" }, { quoted: msg });
  }

  global.gruposAvisosCache = gruposBotAdmin;

  let listado = gruposBotAdmin.map((g, i) => `*${i + 1}.* ${g.subject}`).join('\n');
  conn.sendMessage(chatId, {
    text: `*Grupos donde soy admin:*\n\n${listado}\n\nUsa *.aviso1 <mensaje>* para avisar al grupo 1, *.aviso2 <mensaje>* al 2, etc.`,
    quoted: msg
  });

  // Si quieres ver el debug, descomenta la siguiente línea
  // await conn.sendMessage(chatId, { text: "DEBUG:\n" + debugMsg.slice(0, 4096) }); // WhatsApp limita el tamaño, por si hay muchos grupos
};

handler.command = ["gruposavisos"];
handler.tags = ["admin"];
handler.help = ["gruposavisos"];
module.exports = handler;