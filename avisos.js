const handler = async (msg, { conn, args }) => {
  // Si no hay argumentos, lista los grupos donde está el bot
  if (!args[0]) {
    const chats = await conn.groupFetchAllParticipating();
    const grupos = Object.values(chats);
    if (grupos.length === 0) {
      return conn.sendMessage(
        msg.key.remoteJid,
        { text: "❌ El bot no está en ningún grupo." },
        { quoted: msg }
      );
    }
    let texto = "*Grupos donde está el bot:*\n\n";
    texto += grupos.map((g, i) => `${i + 1}. ${g.subject}\nID: ${g.id}`).join('\n\n');
    texto += "\n\nUsa el comando así para enviar un aviso:\n*.avisos [nombre_o_id_del_grupo] [mensaje]*\n\nEjemplo:\n*.avisos MiGrupo Hola a todos!*";
    return conn.sendMessage(
      msg.key.remoteJid,
      { text: texto },
      { quoted: msg }
    );
  }

  // Si hay argumentos, busca el grupo y manda el aviso
  const grupoArg = args[0];
  const mensaje = args.slice(1).join(" ").trim();

  if (!mensaje) {
    return conn.sendMessage(
      msg.key.remoteJid,
      { text: "⚠️ Escribe el mensaje a enviar. Ejemplo:\n*.avisos MiGrupo Hola a todos!*" },
      { quoted: msg }
    );
  }

  // Busca el grupo por ID exacto o por nombre (parcial, insensible a mayúsculas)
  const chats = await conn.groupFetchAllParticipating();
  const grupos = Object.values(chats);

  let grupo = grupos.find(g => g.id === grupoArg);
  if (!grupo) {
    grupo = grupos.find(g => g.subject && g.subject.toLowerCase().includes(grupoArg.toLowerCase()));
  }

  if (!grupo) {
    return conn.sendMessage(
      msg.key.remoteJid,
      { text: "❌ No se encontró el grupo. Revisa el nombre o el ID (puedes usar *.avisos* solo para ver la lista de grupos)." },
      { quoted: msg }
    );
  }

  // Envía el aviso al grupo seleccionado
  await conn.sendMessage(
    grupo.id,
    { text: `📢 *AVISO DEL GRUPO*\n\n${mensaje}` }
  );

  // Confirma el envío al usuario
  await conn.sendMessage(
    msg.key.remoteJid,
    { text: `✅ Aviso enviado al grupo: *${grupo.subject || grupo.id}*` },
    { quoted: msg }
  );
};

handler.command = ['avisos'];
module.exports = handler;