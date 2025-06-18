let handler = async (m, { conn, text}) => {
  if (!text || text.trim().length === 0) return m.reply('📍 Por favor, proporciona un mensaje de aviso.\nEjemplo:\n.aviso Atención, habrá una actualización del bot.');

  try {
    const chats = Object.entries(conn.chats || {}).filter(([jid]) => jid.endsWith('@g.us'));
    if (!chats.length) return m.reply('🔍 No se encontraron grupos activos para enviar el aviso.');

    const aviso = `📢 *Aviso Importante*\n\n${text}\n\nAtentamente,\nEquipo de administración.`;

    let enviados = 0;
    for (const [jid] of chats) {
      await conn.sendMessage(jid, { text: aviso});
      enviados++;
      await new Promise(resolve => setTimeout(resolve, 1000)); 
}

    return m.reply(`✅ Aviso enviado correctamente a ${enviados} grupo(s).`);

} catch (e) {
    console.error('Error al enviar el aviso:', e);
    return m.reply('❌ Ocurrió un error inesperado al enviar los avisos.');
}
};

handler.command = ['aviso'];
handler.help = ['aviso <mensaje>'];
handler.tags = ['admin'];
handler.admin = true;

export default handler;