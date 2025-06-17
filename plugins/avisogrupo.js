const handler = async (msg, { conn, args }) => {
  let groupId = args[0];
  let texto = args.slice(1).join(' ');

  if (!groupId || !groupId.endsWith("@g.us") || !texto) {
    return conn.sendMessage(msg.key.remoteJid, {
      text: "⚠️ Uso: !avisogrupo [ID del grupo] [mensaje]\n\nPuedes obtener los ID usando !misgruposadmin"
    }, { quoted: msg });
  }

  try {
    await conn.sendMessage(groupId, { text: texto });
    conn.sendMessage(msg.key.remoteJid, {
      text: "✅ Aviso enviado correctamente."
    }, { quoted: msg });
  } catch (e) {
    conn.sendMessage(msg.key.remoteJid, {
      text: "❌ No se pudo enviar el aviso. ¿El bot sigue en ese grupo?"
    }, { quoted: msg });
  }
};
handler.command = ["avisogrupo"];
module.exports = handler;