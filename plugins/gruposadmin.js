const handler = async (msg, { conn }) => {
  const chats = Object.values(await conn.chats.all());
  let groupIds = chats.filter(c => c.id.endsWith("@g.us")).map(c => c.id);

  let adminGroups = [];
  for (let id of groupIds) {
    let metadata;
    try {
      metadata = await conn.groupMetadata(id);
    } catch (e) {
      continue; // por si el bot ya no está en el grupo
    }
    let isBotAdmin = metadata.participants.find(p => p.id === conn.user.jid)?.admin;
    if (isBotAdmin) {
      adminGroups.push({
        name: metadata.subject,
        id: id
      });
    }
  }

  if (!adminGroups.length) {
    return conn.sendMessage(msg.key.remoteJid, {
      text: "❌ No soy administrador en ningún grupo."
    }, { quoted: msg });
  }

  let lista = adminGroups.map((g, i) => `*${i+1}.* ${g.name}\nID: ${g.id}`).join('\n\n');
  conn.sendMessage(msg.key.remoteJid, {
    text: `👑 *Grupos donde soy admin:*\n\n${lista}`
  }, { quoted: msg });
};
handler.command = ["misgruposadmin"];
module.exports = handler;