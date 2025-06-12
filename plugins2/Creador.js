const handler = async (msg, { conn }) => {
  const ownerNumber = "50489513153@s.whatsapp.net"; // Número del creador
  const ownerName = "𝗖𝗵𝗼𝗹𝗼 𝘅𝘇 🤖"; // Nombre visible del creador

  const messageText = `📞 *Contacto del Creador del Subbot:*

Si tienes dudas, preguntas o sugerencias sobre el funcionamiento de *Killua•Bot Subbot*, puedes contactar a su creador.

📌 *Nombre:* 𝗖𝗵𝗼𝗹𝗶𝘁𝗼
📌 *Número:* +504 89513153
💬 *Toca el contacto para enviarle un mensaje directo.`;

  // Enviar contacto vCard
  await conn.sendMessage(msg.key.remoteJid, {
    contacts: {
      displayName: ownerName,
      contacts: [
        {
          vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${ownerName}\nTEL;waid=${ownerNumber.split('@')[0]}:+${ownerNumber.split('@')[0]}\nEND:VCARD`
        }
      ]
    }
  });

  // Enviar texto informativo
  await conn.sendMessage(msg.key.remoteJid, {
    text: messageText
  }, { quoted: msg });
};

handler.command = ['creador'];
module.exports = handler;
