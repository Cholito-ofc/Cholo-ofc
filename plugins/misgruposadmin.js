const handler = async (m, { conn }) => {
  let grupos = await conn.groupFetchAllParticipating();
  let botNumber = (conn.user.id.split(':')[0]).replace(/[^0-9]/g, '') + '@s.whatsapp.net'; // más seguro
  let adminGroups = [];

  for (const [jid, group] of Object.entries(grupos)) {
    let bot = group.participants.find(u => u.id === botNumber);
    if (bot && (bot.admin === 'admin' || bot.admin === 'superadmin')) {
      adminGroups.push({ name: group.subject, id: group.id });
    }
  }

  if (!adminGroups.length) return m.reply('❌ No soy administrador en ningún grupo.');

  let texto = adminGroups.map((g, i) => `*${i + 1}.* ${g.name}\nID: ${g.id}`).join('\n\n');
  return m.reply(`👑 *Grupos donde soy admin:*\n\n${texto}`, m);
};

handler.command = ['misgruposadmin'];
module.exports = handler;