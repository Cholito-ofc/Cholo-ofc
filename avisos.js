const handler = async (msg, { conn, args }) => {
  await conn.sendMessage(
    msg.key.remoteJid,
    { text: "¡Funciona el comando avisos!" },
    { quoted: msg }
  );
};
handler.command = ['avisos'];
module.exports = handler;