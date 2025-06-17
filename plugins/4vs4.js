let handler = async (m, { command, args, usedPrefix }) => {
  global.db.data.partidas = global.db.data.partidas || {};
  let partida = global.db.data.partidas['4vs4'] || {
    hora_mexico: '', hora_colombia: '', modalidad: '', jugadores: '',
    escuadra1: [], suplentes: [], participantes: []
  };
  
  let subcmd = args[0]?.toLowerCase();

  if (subcmd === 'agregar') {
    let tipo = args[1]?.toLowerCase();
    let nombre = args.slice(2).join(' ');
    if (!tipo || !nombre) return m.reply(`Ejemplo: ${usedPrefix + command} agregar escuadra NombreJugador`);
    if (tipo === 'escuadra') {
      if (partida.escuadra1.length >= 4) return m.reply('La escuadra ya tiene 4 jugadores.');
      partida.escuadra1.push(nombre);
    } else if (tipo === 'suplente') {
      if (partida.suplentes.length >= 2) return m.reply('Ya hay 2 suplentes.');
      partida.suplentes.push(nombre);
    } else return m.reply('Tipo no válido. Usa "escuadra" o "suplente".');
    partida.participantes.push(nombre);
  } else if (subcmd === 'quitar') {
    let nombre = args.slice(1).join(' ');
    if (!nombre) return m.reply(`Ejemplo: ${usedPrefix + command} quitar NombreJugador`);
    partida.escuadra1 = partida.escuadra1.filter(j => j !== nombre);
    partida.suplentes = partida.suplentes.filter(j => j !== nombre);
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

  // Mostrar el formato
  let txt = `⏱ 𝐇𝐎𝐑𝐀𝐑𝐈𝐎                   •
🇲🇽 𝐌𝐄𝐗𝐈𝐂𝐎 : ${partida.hora_mexico}
🇨🇴 𝐂𝐎𝐋𝐎𝐌𝐁𝐈𝐀 : ${partida.hora_colombia}

➥ 𝐌𝐎𝐃𝐀𝐋𝐈𝐃𝐀𝐃: ${partida.modalidad}
➥ 𝐉𝐔𝐆𝐀𝐃𝐎𝐑𝐄𝐒: ${partida.jugadores}

      𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔 1
${partida.escuadra1.map((j, i) => i==0 ? `    👑 ┇ ${j}` : `    🥷🏻 ┇ ${j}`).join('\n')}${'\n'.repeat(4 - partida.escuadra1.length)}

    ʚ 𝐒𝐔𝐏𝐋𝐄𝐍𝐓𝐄𝐒:
${partida.suplentes.map(j => `    🥷🏻 ┇ ${j}`).join('\n')}${'\n'.repeat(2 - partida.suplentes.length)}

𝗣𝗔𝗥𝗧𝗜𝗖𝗜𝗣𝗔𝗡𝗧𝗘𝗦 𝗔𝗡𝗢𝗧𝗔𝗗𝗢𝗦:
${partida.participantes.length ? partida.participantes.join('\n') : 'Ninguno aún.'}
`;

  m.reply(txt);
};

handler.help = ['4vs4'].map(v => v + ' [agregar/quitar/set]');
handler.tags = ['games'];
handler.command = /^4vs4$/i;

module.exports = handler;