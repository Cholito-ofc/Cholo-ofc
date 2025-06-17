const handler = async (msg, { conn }) => {
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);

  if (!isOwner) {
    return conn.sendMessage(msg.key.remoteJid, {
      text: "❌ Solo *el dueño del bot* puede usar este comando."
    }, { quoted: msg });
  }

  const chats = await conn.groupFetchAllParticipating();
  const grupos = Object.values(chats);

  const gruposAdmin = [];
  for (const grupo of grupos) {
    try {
      const meta = await conn.groupMetadata(grupo.id);
      const yo = meta.participants.find(p => p.id === conn.user.id);
      if (yo && yo.admin) gruposAdmin.push({ id: grupo.id, subject: meta.subject });
    } catch (e) {
      continue;
    }
  }

  if (gruposAdmin.length === 0) {
    return conn.sendMessage(msg.key.remoteJid, {
      text: "🤖 El bot no es administrador en ningún grupo."
    }, { quoted: msg });
  }

  const listaTexto = gruposAdmin.map((g, i) => `*${i + 1}.* ${g.subject}`).join('\n');

  await conn.sendMessage(msg.key.remoteJid, {
    text: `📄 *Lista de grupos donde el bot es admin:*\n\n${listaTexto}\n\n✅ Usa *.avisos1*, *.avisos2*, etc. para enviar avisos.`
  }, { quoted: msg });
};

handler.command = ['listaravisos'];
module.exports = handler;