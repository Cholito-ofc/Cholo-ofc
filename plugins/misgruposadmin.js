let gruposAdmin = {};
const handler = async (msg, { conn }) => {
    let texto = msg.body || msg.text || '';
    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    // Comando para listar grupos
    if (/^\.listargrupos$/i.test(texto)) {
        let grupos = await conn.groupFetchAllParticipating();
        let lista = [];
        let index = 1;
        gruposAdmin[sender] = [];
        for (const id in grupos) {
            const grupo = grupos[id];
            if (grupo.participants.some(p => p.id === conn.user.id && p.admin)) {
                lista.push(`${index}. ${grupo.subject}`);
                gruposAdmin[sender].push(id);
                index++;
            }
        }
        if (lista.length === 0) return conn.sendMessage(chatId, { text: 'No soy admin en ningún grupo.' }, { quoted: msg });
        return conn.sendMessage(chatId, { text: `Grupos donde soy admin:\n\n${lista.join('\n')}\n\nUsa .avisoX <mensaje> para enviar un aviso a ese grupo.` }, { quoted: msg });
    }

    // Comando para enviar aviso
    let match = texto.match(/^\.aviso(\d+)\s([\s\S]+)/i);
    if (match) {
        let num = parseInt(match[1]);
        let mensaje = match[2];
        if (!gruposAdmin[sender] || !gruposAdmin[sender][num - 1]) {
            return conn.sendMessage(chatId, { text: "Debes usar primero .listargrupos para ver la lista." }, { quoted: msg });
        }
        let grupoId = gruposAdmin[sender][num - 1];
        try {
            await conn.sendMessage(grupoId, { text: mensaje });
            await conn.sendMessage(chatId, { text: "✅ Aviso enviado correctamente." }, { quoted: msg });
        } catch (e) {
            await conn.sendMessage(chatId, { text: "❌ No pude enviar el aviso." }, { quoted: msg });
        }
        return;
    }
};

handler.command = ['listargrupos', 'aviso'];
module.exports = handler;