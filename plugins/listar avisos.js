const handler = async (msg, { conn }) => {
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);

  if (!isOwner) {
    return conn.sendMessage(msg.key.remoteJid, {
      text: "❌ Solo el *dueño del bot* puede usar este comando."
    }, { quoted: msg });
  }

  const allChats = Object.keys(conn.chats).filter(v => v.endsWith("@g.us"));
  const gruposAdmin = [];

  for (const jid of allChats) {
    try {
      const meta = await conn.groupMetadata(jid);
      const yo = meta.participants.find(p => p.id === conn.user.id);
      if (yo && yo.admin) {
        gruposAdmin.push({ id: jid, name: meta.subject });
      }
    } catch (e) {
      continue; // por si el grupo fue eliminado o el bot fue expulsado
    }
  }

  if (gruposAdmin.length === 0) {
    return conn.sendMessage(msg.key.remoteJid, {
      text: "⚠️ El bot no es administrador en ningún grupo."
    }, { quoted: msg });
  }

  const listado = gruposAdmin.map((g, i) => `*${i + 1}.* ${g.name}`).join('\n');

  const buttons = gruposAdmin.slice(0, 10).map((g, i) => ({
    buttonId: `.avisos${i + 1} Aquí tu mensaje`,
    buttonText: { displayText: `📣 Aviso a #${i + 1}` },
    type: 1
  }));

  await conn.sendMessage(msg.key.remoteJid, {
    text: `📋 *Lista de grupos donde el bot es admin:*\n\n${listado}\n\n✅ Usa *.avisos1*, *.avisos2*, etc.`,
    buttons,
    footer: "Elder Bot",
    headerType: 1
  }, { quoted: msg });
};

handler.command = ['listaravisos'];
module.exports = handler;