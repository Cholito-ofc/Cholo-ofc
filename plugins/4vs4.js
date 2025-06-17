// plugins/4vs4.js

const roles4vs4 = {}; // { [chatId]: { titulares: [], suplentes: [], lastMsgKey } }

const renderMsg = (chatId) => {
  const datos = roles4vs4[chatId] || { titulares: [], suplentes: [], lastMsgKey: null };
  let txt =
    `*4VS4 FREE FIRE*\n\n` +
    `*Titulares:*\n` +
    (datos.titulares[0] ? `🥇 ${datos.titulares[0]}\n` : `🥇 (vacío)\n`) +
    (datos.titulares[1] ? `🥈 ${datos.titulares[1]}\n` : `🥈 (vacío)\n`) +
    (datos.titulares[2] ? `🥉 ${datos.titulares[2]}\n` : `🥉 (vacío)\n`) +
    (datos.titulares[3] ? `🏅 ${datos.titulares[3]}\n` : `🏅 (vacío)\n`) +
    `\n*Suplentes:*\n` +
    (datos.suplentes[0] ? `🧤 ${datos.suplentes[0]}\n` : `🧤 (vacío)\n`) +
    (datos.suplentes[1] ? `🧤 ${datos.suplentes[1]}\n` : `🧤 (vacío)\n`);

  return txt;
};

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  if (!chatId.endsWith('@g.us'))
    return conn.sendMessage(chatId, { text: '❌ Este comando solo puede usarse en grupos.' }, { quoted: msg });

  if (!roles4vs4[chatId]) roles4vs4[chatId] = { titulares: [], suplentes: [], lastMsgKey: null };

  const botones = [
    { buttonId: '.soyTitular', buttonText: { displayText: '🥇 Titular' }, type: 1 },
    { buttonId: '.soySuplente', buttonText: { displayText: '🧤 Suplente' }, type: 1 }
  ];

  // Si ya hay mensaje para editar, edítalo; si no, mándalo y guarda el key
  if (roles4vs4[chatId].lastMsgKey) {
    await conn.sendMessage(chatId, {
      edit: roles4vs4[chatId].lastMsgKey,
      text: renderMsg(chatId),
      buttons: botones,
      headerType: 1
    });
  } else {
    const sent = await conn.sendMessage(chatId, {
      text: renderMsg(chatId),
      buttons: botones,
      headerType: 1
    }, { quoted: msg });
    roles4vs4[chatId].lastMsgKey = sent.key;
  }
};
handler.command = ['4vs4'];
module.exports = handler;

// Handler para el botón Titular
handler.soyTitular = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  if (!chatId.endsWith('@g.us')) return;
  if (!roles4vs4[chatId]) roles4vs4[chatId] = { titulares: [], suplentes: [], lastMsgKey: null };

  const participante = `@${(msg.key.participant || msg.key.remoteJid).split('@')[0]}`;
  // Si ya es titular, ignora
  if (roles4vs4[chatId].titulares.includes(participante)) return;
  // Si ya hay 4 titulares, ignora
  if (roles4vs4[chatId].titulares.length >= 4) return;
  // Si estaba como suplente, quítalo de suplentes
  roles4vs4[chatId].suplentes = roles4vs4[chatId].suplentes.filter(u => u !== participante);
  // Agrégalo a titulares
  roles4vs4[chatId].titulares.push(participante);

  // Si había más de 4 titulares por error, recorta
  roles4vs4[chatId].titulares = roles4vs4[chatId].titulares.slice(0, 4);

  // Edita el mensaje
  if (roles4vs4[chatId].lastMsgKey) {
    await conn.sendMessage(chatId, {
      edit: roles4vs4[chatId].lastMsgKey,
      text: renderMsg(chatId),
      buttons: [
        { buttonId: '.soyTitular', buttonText: { displayText: '🥇 Titular' }, type: 1 },
        { buttonId: '.soySuplente', buttonText: { displayText: '🧤 Suplente' }, type: 1 }
      ],
      headerType: 1,
      mentions: [msg.key.participant]
    });
  }
};
handler.soyTitular.command = ['soyTitular'];

// Handler para el botón Suplente
handler.soySuplente = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  if (!chatId.endsWith('@g.us')) return;
  if (!roles4vs4[chatId]) roles4vs4[chatId] = { titulares: [], suplentes: [], lastMsgKey: null };

  const participante = `@${(msg.key.participant || msg.key.remoteJid).split('@')[0]}`;
  // Si ya es suplente, ignora
  if (roles4vs4[chatId].suplentes.includes(participante)) return;
  // Si ya hay 2 suplentes, ignora
  if (roles4vs4[chatId].suplentes.length >= 2) return;
  // Si estaba como titular, quítalo de titulares
  roles4vs4[chatId].titulares = roles4vs4[chatId].titulares.filter(u => u !== participante);
  // Agrégalo a suplentes
  roles4vs4[chatId].suplentes.push(participante);

  // Si había más de 2 suplentes por error, recorta
  roles4vs4[chatId].suplentes = roles4vs4[chatId].suplentes.slice(0, 2);

  // Edita el mensaje
  if (roles4vs4[chatId].lastMsgKey) {
    await conn.sendMessage(chatId, {
      edit: roles4vs4[chatId].lastMsgKey,
      text: renderMsg(chatId),
      buttons: [
        { buttonId: '.soyTitular', buttonText: { displayText: '🥇 Titular' }, type: 1 },
        { buttonId: '.soySuplente', buttonText: { displayText: '🧤 Suplente' }, type: 1 }
      ],
      headerType: 1,
      mentions: [msg.key.participant]
    });
  }
};
handler.soySuplente.command = ['soySuplente'];