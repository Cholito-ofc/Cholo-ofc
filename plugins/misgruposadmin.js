// Este array almacenará los IDs de los grupos donde el bot es admin y quien solicitó la lista.
let gruposAdmin = {};
const handler = async (msg, { conn, isOwner }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const prefix = global.prefix;

  // Listar grupos donde el bot es admin
  if (/^\.listargrupos$/i.test(msg.body)) {
    let grupos = await conn.groupFetchAllParticipating();
    let lista = [];
    let index = 1;
    gruposAdmin[sender] = []; // Guardamos la lista para este usuario
    for (let id in grupos) {
      let grupo = grupos[id];
      if (grupo.participants.some(p => p.id === conn.user.id && p.admin)) {
        lista.push(`${index}. ${grupo.subject}`);
        gruposAdmin[sender].push(id);
        index++;
      }
    }
    if (lista.length === 0) return conn.sendMessage(chatId, { text: 'No soy admin en ningún grupo.' }, { quoted: msg });
    await conn.sendMessage(chatId, { text: `Grupos donde soy admin:\n\n${lista.join('\n')}\n\nUsa .avisoX <mensaje> para enviar un aviso a ese grupo.` }, { quoted: msg });
    return;
  }

  // Detectar comando .avisoX
  let match = msg.body.match(/^\.aviso(\d+)\s([\s\S]+)/i);
  if (match) {
    let num = parseInt(match[1]);
    let texto = match[2];
    if (!gruposAdmin[sender] || !gruposAdmin[sender][num - 1]) return conn.sendMessage(chatId, { text: "Debes usar primero .listargrupos para ver la lista." }, { quoted: msg });
    let grupoId = gruposAdmin[sender][num - 1];
    try {
      await conn.sendMessage(grupoId, { text: texto });
      await conn.sendMessage(chatId, { text: "✅ Aviso enviado correctamente." }, { quoted: msg });
    } catch (err) {
      await conn.sendMessage(chatId, { text: "❌ No pude enviar el aviso." }, { quoted: msg });
    }
    return;
  }
};

handler.command = ['listargrupos', 'aviso']; // El handler principal es 'listargrupos', pero 'aviso' lo detectamos manual
module.exports = handler;