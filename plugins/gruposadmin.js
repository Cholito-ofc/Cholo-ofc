const handler = async (msg, { conn, args }) => {
  // 1. Obtener todos los chats tipo grupo
  const chats = Object.values(await conn.chats.all());
  let groupIds = chats.filter(c => c.id.endsWith("@g.us")).map(c => c.id);

  let adminGroups = [];
  for (let id of groupIds) {
    let metadata;
    try {
      metadata = await conn.groupMetadata(id);
    } catch (e) {
      continue;
    }
    let isBotAdmin = metadata.participants.find(p => p.id === conn.user.jid && p.admin);
    if (isBotAdmin) {
      adminGroups.push({
        name: metadata.subject,
        id: id
      });
    }
  }

  // Si no hay argumentos: solo listar grupos
  if (!args[0]) {
    if (!adminGroups.length) {
      return conn.sendMessage(msg.key.remoteJid, {
        text: "❌ No soy administrador en ningún grupo."
      }, { quoted: msg });
    }
    let lista = adminGroups.map((g, i) => `*${i+1}.* ${g.name}\nID: ${g.id}`).join('\n\n');
    return conn.sendMessage(msg.key.remoteJid, {
      text: `👑 *Grupos donde soy admin:*\n\n${lista}\n\nEnvía:\n!gruposadmin [número de grupo] [mensaje]\nEjemplo: !gruposadmin 2 Reunión a las 8pm`
    }, { quoted: msg });
  }

  // Si hay argumentos: enviar mensaje
  let idx = parseInt(args[0]) - 1;
  if (isNaN(idx) || idx < 0 || idx >= adminGroups.length) {
    return conn.sendMessage(msg.key.remoteJid, {
      text: "❌ Número de grupo inválido. Usa el comando sin argumentos para ver la lista."
    }, { quoted: msg });
  }
  let texto = args.slice(1).join(' ');
  if (!texto) {
    return conn.sendMessage(msg.key.remoteJid, {
      text: "❌ Escribe el mensaje que quieres enviar. Ejemplo:\n!gruposadmin 2 Aviso importante."
    }, { quoted: msg });
  }

  // Enviar el aviso
  try {
    await conn.sendMessage(adminGroups[idx].id, { text: texto });
    conn.sendMessage(msg.key.remoteJid, {
      text: `✅ Aviso enviado en *${adminGroups[idx].name}*`
    }, { quoted: msg });
  } catch (e) {
    conn.sendMessage(msg.key.remoteJid, {
      text: "❌ No se pudo enviar el aviso. ¿El bot sigue en ese grupo?"
    }, { quoted: msg });
  }
};
handler.command = ["gruposadmin"];
module.exports = handler;