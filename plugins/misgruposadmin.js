const handler = async (msg, { conn }) => {
  // Obtener todos los chats tipo grupo
  let allChats = await conn.groupFetchAllParticipating?.() || {};
  let grupos = Object.values(allChats);

  let adminGroups = [];
  for (let g of grupos) {
    try {
      let meta = await conn.groupMetadata(g.id);
      let bot = meta.participants.find(u => u.id === conn.user.jid);
      if (bot && bot.admin) {
        adminGroups.push({ name: meta.subject, id: meta.id });
      }
    } catch {}
  }

  if (!adminGroups.length) {
    return conn.sendMessage(msg.key.remoteJid, {
      text: "❌ No soy administrador en ningún grupo."
    }, { quoted: msg });
  }

  let texto = adminGroups.map((g, i) => `*${i + 1}.* ${g.name}\nID: ${g.id}`).join('\n\n');
  conn.sendMessage(msg.key.remoteJid, {
    text: `👑 *Grupos donde soy admin:*\n\n${texto}`
  }, { quoted: msg });
};

handler.command = ["misgruposadmin"];
module.exports = handler;