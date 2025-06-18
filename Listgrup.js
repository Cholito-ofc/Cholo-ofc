let gruposAdmin = {} 

const handler = async (m, { conn, args, command, usedPrefix }) => {
  if (command === 'listgrup') {
    try {
      gruposAdmin = {} 

      const groups = Object.entries(conn.chats)
        .filter(([jid, chat]) =>
          jid.endsWith('@g.us') &&
          chat.isChats &&
          chat.metadata?.participants?.some(p => p.id === conn.user.jid && p.admin === 'admin')
        )

      if (groups.length === 0) return m.reply('⚠️ No soy administrador en ningún grupo.')

      let texto = '*📋 Lista de grupos donde soy admin:*\n\n'
      for (let i = 0; i < groups.length; i++) {
        const [jid, chat] = groups[i]
        const metadata = chat.metadata || (await conn.groupMetadata(jid).catch(() => null)) || {}
        const nombre = metadata.subject || await conn.getName(jid)
        texto += `${i + 1}. ${nombre}\n`
        gruposAdmin[i + 1] = jid
      }

      texto += `\n✅ Usa *${usedPrefix}seraviso <número> <mensaje>* para enviar un aviso a ese grupo.`

      m.reply(texto)
    } catch (e) {
      console.error(e)
      m.reply('❌ Ocurrió un error al obtener los grupos.')
    }
  }

  if (command === 'avisot') {
    const numero = parseInt(args[0])
    const mensaje = args.slice(1).join(' ')

    if (!numero || !mensaje) {
      return m.reply(`❌ Uso incorrecto.\nEjemplo: *${usedPrefix}seraviso 2 Este es un aviso*`)
    }

    const jid = gruposAdmin[numero]
    if (!jid) return m.reply('❌ Número inválido. Usa *groupplease* para listar los grupos primero.')

    try {
      await conn.sendMessage(jid, {
        text: `📢 *AVISO DEL BOT:*\n\n${mensaje}`
      })
      m.reply('✅ Aviso enviado correctamente.')
    } catch (e) {
      console.error(e)
      m.reply('❌ Ocurrió un error al enviar el aviso.')
    }
  }
}

handler.help = ['listgrup', 'avisot <número> <mensaje>']
handler.tags = ['grupos']
handler.command = ['listgrup', 'avisot']
handler.rowner = true 

export default handler