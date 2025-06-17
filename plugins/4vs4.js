let handler = async (m, { command, args, usedPrefix }) => {
  global.db.data.partidas = global.db.data.partidas || {};
  let partida = global.db.data.partidas['4vs4'] || {
    hora_mexico: '',
    hora_colombia: '',
    modalidad: '',
    jugadores: '',
    escuadra1: ['', '', '', ''], // 4 lugares
    suplentes: ['', ''], // 2 lugares
    participantes: []
  };

  let subcmd = args[0]?.toLowerCase();

  if (subcmd === 'agregar') {
    let tipo = args[1]?.toLowerCase();
    let nombre = args.slice(2).join(' ');
    if (!tipo || !nombre) return m.reply(`Ejemplo:\n${usedPrefix + command} agregar escuadra NombreJugador\n${usedPrefix + command} agregar suplente NombreJugador`);
    if (tipo === 'escuadra') {
      let libre = partida.escuadra1.indexOf('');
      if (libre == -1) return m.reply('La escuadra ya tiene 4 jugadores.');
      partida.escuadra1[libre] = nombre;
    } else if (tipo === 'suplente') {
      let libre = partida.suplentes.indexOf('');
      if (libre == -1) return m.reply('Ya hay 2 suplentes.');
      partida.suplentes[libre] = nombre;
    } else return m.reply('Tipo no válido. Usa "escuadra" o "suplente".');
    if (!partida.participantes.includes(nombre)) partida.participantes.push(nombre);
  } else if (subcmd === 'quitar') {
    let nombre = args.slice(1).join(' ');
    if (!nombre) return m.reply(`Ejemplo:\n${usedPrefix + command} quitar NombreJugador`);
    let i = partida.escuadra1.indexOf(nombre);
    if (i != -1) partida.escuadra1[i] = '';
    let j = partida.suplentes.indexOf(nombre);
    if (j != -1) partida.suplentes[j] = '';
    partida.participantes = partida.participantes.filter(j => j !== nombre);
  } else if (subcmd === 'set') {
    let campo = args[1]?.toLowerCase();
    let valor = args.slice(2).join(' ');
    if (!campo || !valor) return m.reply(`Ejemplo: ${usedPrefix + command} set hora_mexico 20:00`);
    if (['hora_mexico','hora_colombia','modalidad','jugadores'].includes(campo)) {
      partida[campo] = valor;
    } else return m.reply('Campo inválido.');
  }

  global.db.data.partidas['4vs4'] = partida;

  // Mostrar el formato EXACTO
  let txt = `⏱ 𝐇𝐎𝐑𝐀𝐑𝐈𝐎                   •
🇲🇽 𝐌𝐄𝐗𝐈𝐂𝐎 : ${partida.hora_mexico}
🇨🇴 𝐂𝐎𝐋𝐎𝐌𝐁𝐈𝐀 : ${partida.hora_colombia}

➥ 𝐌𝐎𝐃𝐀𝐋𝐈𝐃𝐀𝐃: ${partida.modalidad}
➥ 𝐉𝐔𝐆𝐀𝐃𝐎𝐑𝐄𝐒: ${partida.jugadores}

      𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔 1

    👑 ┇ ${partida.escuadra1[0] || ''}
    🥷🏻 ┇ ${partida.escuadra1[1] || ''}
    🥷🏻 ┇ ${partida.escuadra1[2] || ''}
    🥷🏻 ┇ ${partida.escuadra1[3] || ''}

    ʚ 𝐒𝐔𝐏𝐋𝐄𝐍𝐓𝐄𝐒:
    🥷🏻 ┇ ${partida.suplentes[0] || ''}
    🥷🏻 ┇ ${partida.suplentes[1] || ''}

𝗣𝗔𝗥𝗧𝗜𝗖𝗜𝗣𝗔𝗡𝗧𝗘𝗦 𝗔𝗡𝗢𝗧𝗔𝗗𝗢𝗦:
${partida.participantes.length ? partida.participantes.join('\n') : 'Ninguno aún.'}
`;

  m.reply(txt);
};

handler.help = ['4vs4'].map(v => v + ' [agregar/quitar/set]');
handler.tags = ['games'];
handler.command = /^4vs4$/i;

module.exports = handler;