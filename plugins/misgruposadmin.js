const handler = async (m, { conn }) => {
  let texto = '';
  let gruposAdmin = [];
  try {
    // 1. Carga todos los grupos donde el bot está presente
    let grupos = await conn.groupFetchAllParticipating();
    let botJid = conn.decodeJid ? conn.decodeJid(conn.user.id) : (conn.user.jid || conn.user.id);

    for (const [jid, group] of Object.entries(grupos)) {
      // 2. Asegura que la propiedad participants existe y está cargada
      if (!group.participants) continue;
      // 3. Busca al bot entre los participantes y verifica si es admin o superadmin
      let bot = group.participants.find(u =>
        u.id === botJid ||
        (botJid && botJid.includes(u.id.split('@')[0]))
      );
      if (bot && (bot.admin === 'admin' || bot.admin === 'superadmin')) {
        gruposAdmin.push({
          name: group.subject,
          id: group.id
        });
      }
    }
  } catch (e) {
    return m.reply('❌ Error al obtener los grupos. ¿El bot está actualizado y en grupos?');
  }

  if (!gruposAdmin.length) {
    return m.reply('❌ No soy administrador en ningún grupo.');
  }

  texto = gruposAdmin.map((g, i) => `*${i + 1}.* ${g.name}\nID: ${g.id}`).join('\n\n');
  m.reply(`👑 *Grupos donde soy admin:*\n\n${texto}\n\n*Usa el número e ID para comandos de aviso global si los quieres usar.*`);
};

handler.command = ["misgruposadmin"];
module.exports = handler;