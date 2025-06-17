const handler = async (m, { conn }) => {
  // Usa el método recomendado para obtener todos los grupos donde el bot está presente
  let chats = await conn.groupFetchAllParticipating();
  let grupos = Object.entries(chats).map(([jid, data]) => data);

  let adminGroups = [];

  for (let group of grupos) {
    try {
      // Busca el JID del bot entre los participantes
      let bot = group.participants.find(u => (u.id === conn.decodeJid(conn.user.id) || u.id === conn.user.jid));
      if (bot && bot.admin) {
        adminGroups.push({ name: group.subject, id: group.id });
      }
    } catch {}
  }

  if (!adminGroups.length) {
    return conn.reply(m.chat, "❌ No soy administrador en ningún grupo.", m);
  }

  let texto = adminGroups.map((g, i) => `*${i + 1}.* ${g.name}\nID: ${g.id}`).join('\n\n');
  return conn.reply(m.chat, `👑 *Grupos donde soy admin:*\n\n${texto}`, m);
};

handler.command = ["misgruposadmin"];
module.exports = handler;