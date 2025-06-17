const handler = async (m, { conn }) => {
  // Depuración: para ver si entra al comando
  console.log("Comando misgruposadmin ejecutado");

  let chats = await conn.groupFetchAllParticipating();
  let grupos = Object.values(chats);

  let adminGroups = [];
  let botJid = (conn.user && conn.user.id) ? conn.decodeJid(conn.user.id) : null;

  for (let group of grupos) {
    try {
      // En algunos bots la propiedad puede ser .participants o .participants
      let bot = group.participants.find(u => u.id === botJid);
      if (bot && bot.admin) {
        adminGroups.push({ name: group.subject, id: group.id });
      }
    } catch (e) {
      // Por si hay error en algún grupo
      continue;
    }
  }

  if (!adminGroups.length) {
    await conn.reply(m.chat, "❌ No soy administrador en ningún grupo.", m);
    return;
  }

  let txt = adminGroups.map((g, i) => `*${i + 1}.* ${g.name}\nID: ${g.id}`).join('\n\n');
  await conn.reply(m.chat, `👑 *Grupos donde soy admin:*\n\n${txt}`, m);
};

handler.command = ["misgruposadmin"];
module.exports = handler;