// plugins/gruposavisos.js

// Base de datos persistente (puedes usar cualquier persistencia real si quieres)
global.gruposAvisosDB = global.gruposAvisosDB || {};

async function registrarGrupoSiAdmin(conn, groupId) {
  try {
    const metadata = await conn.groupMetadata(groupId);
    const botNumber = (conn.user?.id || conn.user?.jid || "").replace(/[^0-9]/g, "");
    const botParticipant = metadata.participants.find(
      p => (p.id || p.jid || "").replace(/[^0-9]/g, "") === botNumber
    );
    const isAdmin = botParticipant &&
      (botParticipant.admin === "admin" ||
       botParticipant.admin === "superadmin" ||
       botParticipant.admin === true ||
       botParticipant.admin === "true" ||
       botParticipant.isAdmin === true);

    if (isAdmin) {
      global.gruposAvisosDB[groupId] = metadata.subject || "Sin Nombre";
    } else {
      delete global.gruposAvisosDB[groupId];
    }
  } catch (e) {
    // Grupo inaccesible o bot fuera
    delete global.gruposAvisosDB[groupId];
  }
}

// REGISTRA grupo cada vez que recibe un mensaje
const groupRegisterHandler = async (msg, { conn }) => {
  const groupId = msg.key.remoteJid;
  if (groupId && groupId.endsWith("@g.us")) {
    await registrarGrupoSiAdmin(conn, groupId);
  }
};
handler.all = groupRegisterHandler;

// Comando para listar grupos donde el bot es admin
handler.command = ["gruposavisos"];
handler.tags = ["admin"];
handler.help = ["gruposavisos"];
handler.run = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isOwner = (global.owner || []).some(([id]) => id === senderNum);
  const isFromMe = msg.key.fromMe;

  if (!isOwner && !isFromMe) {
    return conn.sendMessage(chatId, { text: "🚫 *Solo el owner o el bot pueden usar este comando.*" }, { quoted: msg });
  }

  const gruposBotAdmin = Object.entries(global.gruposAvisosDB)
    .map(([id, subject]) => ({ id, subject }));

  if (!gruposBotAdmin.length) {
    return conn.sendMessage(chatId, { text: "❌ *No estoy como admin en ningún grupo, o no he sido registrado aún. Escribe un mensaje en el grupo donde soy admin.*" }, { quoted: msg });
  }

  global.gruposAvisosCache = gruposBotAdmin;
  let listado = gruposBotAdmin.map((g, i) => `*${i + 1}.* ${g.subject}`).join('\n');
  conn.sendMessage(chatId, {
    text: `*Grupos donde soy admin:*\n\n${listado}\n\nUsa *.aviso1 <mensaje>* para avisar al grupo 1, *.aviso2 <mensaje>* al 2, etc.`,
    quoted: msg
  });
};
module.exports = handler;