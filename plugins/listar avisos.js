const handler = async (msg, { conn }) => {
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);

  if (!isOwner) {
    return conn.sendMessage(msg.key.remoteJid, {
      text: "❌ Solo el *dueño del bot* puede usar este comando."
    }, { quoted: msg });
  }

  // Obtener todos los chats donde el bot está
  const chats = Object.entries(conn.chats).filter(([jid, chat]) => jid.endsWith('@g.us'));

  const gruposAdmin = [];

  for (const [jid] of chats) {
    try {
      const meta = await conn.groupMetadata(jid);
      const yo = meta.participants.find(p => p.id === conn.user.id);
      if (yo?.admin) {
        gruposAdmin.push({ id: jid, name: meta.subject });
      }
    } catch (e) {
      // Grupo eliminado o sin permisos
      continue;
    }
  }

  if (!gruposAdmin.length) {
    return conn.sendMessage(msg.key.remoteJid, {
      text: "⚠️ El bot no es administrador en ningún grupo."
    }, { quoted: msg });
  }

  const texto = gruposAdmin.map((g, i) => `*${i + 1}.* ${g.name}`).join('\n');

  const sections = [{
    title: "Enviar aviso a:",
    rows: gruposAdmin.map((g, i) => ({
      title: `${i + 1}. ${g.name}`,
      rowId: `.avisos${i + 1} Escribe tu mensaje aquí...`
    }))
  }];

  await conn.sendMessage(msg.key.remoteJid, {
    text: `📋 *Lista de grupos donde el bot es admin:*\n\n${texto}\n\n✅ Pulsa uno para enviar aviso.`,
    footer: 'Bot Bazaar',
    buttonText: "Seleccionar grupo",
    sections
  }, { quoted: msg });
};

handler.command = ['listaravisos'];
module.exports = handler;