const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;

  const horaTexto = args.join(" ").trim();
  if (!horaTexto) {
    return conn.sendMessage(chatId, {
      text: "✳️ Usa el comando así:\n*.4vs4 [hora]*\nEjemplo: *.4vs4 5:00pm*"
    }, { quoted: msg });
  }

  // Conversión de hora
  const to24Hour = (str) => {
    let [time, modifier] = str.toLowerCase().split(/(am|pm)/);
    let [h, m] = time.split(":").map(n => parseInt(n));
    if (modifier === 'pm' && h !== 12) h += 12;
    if (modifier === 'am' && h === 12) h = 0;
    return { h, m: m || 0 };
  };
  const to12Hour = (h, m) => {
    const suffix = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return `${h}:${m.toString().padStart(2, '0')}${suffix}`;
  };
  const base = to24Hour(horaTexto);

  // Solo México, Colombia, Venezuela
  const zonas = [
    { pais: "🇲🇽 MÉXICO", offset: 0 },
    { pais: "🇨🇴 COLOMBIA", offset: 1 },
    { pais: "🇻🇪 VENEZUELA", offset: 2 }
  ];

  const horaMsg = zonas.map(z => {
    let newH = base.h + z.offset;
    let newM = base.m;
    if (newH >= 24) newH -= 24;
    return `${z.pais} : ${to12Hour(newH, newM)}`;
  }).join("\n");

  const textoFinal =
`*6 𝐕𝐒 6 - ESCUADRA ÚNICA*

⏱ 𝐇𝐎𝐑𝐀𝐑𝐈𝐎
${horaMsg}

➥ 𝐌𝐎𝐃𝐀𝐋𝐈𝐃𝐀𝐃: 🔫 Clásico
➥ 𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔 𝗧𝗜𝗧𝗨𝗟𝗔𝗥 (APÚNTATE):
👑 ┇ 
🥷🏻 ┇ 
🥷🏻 ┇ 
🥷🏻 ┇ 
🥷🏻 ┇ 
🥷🏻 ┇ 
➥ 𝗦𝗨𝗣𝗟𝗘𝗡𝗧𝗘𝗦 (APÚNTATE):
🥷🏻 ┇ 
🥷🏻 ┇ 
`;

  await conn.sendMessage(chatId, {
    text: textoFinal
  }, { quoted: msg });
};

handler.command = ['6vs6'];
module.exports = handler;