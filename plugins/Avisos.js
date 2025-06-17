const { getGroupAdmins } = require('../lib/functions') // O usa tu propia función para obtener admins

module.exports = {
    name: 'avisos',
    alias: ['anuncio', 'aviso'],
    description: 'Envía un mensaje de aviso a todos los grupos donde el bot es admin.',
    category: 'admin',
    async run(m, { conn, text, usedPrefix, command }) {
        if (!text) return m.reply(`*Ejemplo de uso:* ${usedPrefix}${command} [mensaje]\n\nEnvía el aviso a todos los grupos donde el bot es admin.`)

        let chats = Object.values(await conn.groupFetchAllParticipating ? await conn.groupFetchAllParticipating() : await conn.groupMetadata())
        let grupos = chats.filter(v => v.id && v.participants) // Filtra grupos válidos
        let enviados = 0

        for (let group of grupos) {
            try {
                let isBotAdmin = group.participants?.some(p => p.id === conn.user.id && p.admin)
                if (isBotAdmin) {
                    await conn.sendMessage(group.id, { text: `*AVISO:*\n${text}` }, { quoted: m })
                    enviados++
                }
            } catch (e) {
                // Si no puede enviar, lo ignora
                continue
            }
        }

        m.reply(`✅ Aviso enviado a ${enviados} grupo(s) donde el bot es admin.`)
    }
}