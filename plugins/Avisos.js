let handler = async (m, { conn, args }) => {
  try {
    if (!args[0]) {
      let chats = await conn.groupFetchAllParticipating();
      let grupos = Object.values(chats);
      if (grupos.length === 0) return m.reply("❌ El bot no está en ningún grupo.");

      let texto = "*Grupos donde está el bot:*\n\n";
      texto += grupos.map((g, i) => `${i + 1}. ${g.subject}\nID: ${g.id}`).join('\n\n');
      texto += "\n\nUsa el comando así para enviar un aviso:\n*.avisos [nombre_o_id_del_grupo] [mensaje]*\n\nEjemplo:\n*.avisos MiGrupo Hola a todos!*";
      return m.reply(texto);
    }

    let grupoArg = args[0];
    let mensaje = args.slice(1).join(" ").trim();

    if (!mensaje) return m.reply("⚠️ Escribe el mensaje a enviar. Ejemplo:\n*.avisos MiGrupo Hola a todos!*");

    let chats = await conn.groupFetchAllParticipating();
    let grupos = Object.values(chats);

    let grupo = grupos.find(g => g.id === grupoArg);
    if (!grupo) {
      grupo = grupos.find(g => g.subject && g.subject.toLowerCase().includes(grupoArg.toLowerCase()));
    }

    if (!grupo) return m.reply("❌ No se encontró el grupo. Revisa el nombre o el ID (usa *.avisos* solo para ver la lista de grupos).");

    await conn.sendMessage(
      grupo.id,
      { text: `📢 *AVISO DEL GRUPO*\n\n${mensaje}` }
    );

    return m.reply(`✅ Aviso enviado al grupo: *${grupo.subject || grupo.id}*`);
  } catch (e) {
    return m.reply('❌ Hubo un error ejecutando el comando. Revisa la consola.');
  }
};

handler.help = ['avisos'];
handler.tags = ['group'];
handler.command = /^avisos$/i;
export default handler;