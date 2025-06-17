const handler = async (msg, { conn, args, command }) => {
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);

  if (!isOwner) {
    return conn.sendMessage(msg.key.remoteJid, {
      text: "❌ Solo *el dueño del bot* puede usar este comando."
    }, { quoted: msg });
  }

  // Extrae número de comando: avisos1, avisos2, etc.
  const index = parseInt(command.replace('avisos', ''));
  if (isNaN(index)) {
    return conn.sendMessage(msg.key.remoteJid, {
      text: "❌ Usa un comando válido como *.avisos1* o *.avisos2*"
    }, { quoted: msg });
  }

  // Obtener lista de chats del bot
  const chats = await conn.groupFetchAllParticipating();
  const grupos = Object.values(chats);

  // Filtrar solo donde el bot es admin
  const gruposAdmin = [];
  for (const grupo of grupos) {
    try {
      const meta = await conn.groupMetadata(grupo.id);
      const yo = meta.participants.find(p => p.id === conn.user.id);
      if (yo && yo.admin) gruposAdmin.push(grupo.id);
    } catch (e) {
      continue;
    }
  }

  if (index > gruposAdmin.length || index < 1) {
    return conn.sendMessage(msg.key.remoteJid, {
      text: `❌ No hay un grupo número ${index} en la lista de grupos donde el bot es admin.\nActualmente hay ${gruposAdmin.length} grupos.`
    }, { quoted: msg });
  }

  const texto = args.join(' ').trim();
  if (!texto) {
    return conn.sendMessage(msg.key.remoteJid, {
      text: '✏️ Debes escribir un mensaje para enviar.\nEjemplo:\n*.avisos3 Torneo hoy a las 6PM.*'
    }, { quoted: msg });
  }

  const destino = gruposAdmin[index - 1];

  await conn.sendMessage(destino, {
    text: `📣 *Aviso del dueño del bot:*\n\n${texto}`
  });

  await conn.sendMessage(msg.key.remoteJid, {
    text: `✅ Aviso enviado correctamente al grupo #${index}.`
  }, { quoted: msg });
};

handler.command = [
  /^avisos[1-9][0-9]*$/i  // acepta avisos1, avisos2, ..., avisos99+
];

module.exports = handler;