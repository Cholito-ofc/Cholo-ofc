def mostrar_4vs4(
    hora_mexico, hora_colombia,
    modalidad, jugadores,
    escuadra1, suplentes, participantes_anotados
):
    print("⏱ 𝐇𝐎𝐑𝐀𝐑𝐈𝐎                   •")
    print(f"🇲🇽 𝐌𝐄𝐗𝐈𝐂𝐎 : {hora_mexico}")
    print(f"🇨🇴 𝐂𝐎𝐋𝐎𝐌𝐁𝐈𝐀 : {hora_colombia}\n")
    print(f"➥ 𝐌𝐎𝐃𝐀𝐋𝐈𝐃𝐀𝐃: {modalidad}")
    print(f"➥ 𝐉𝐔𝐆𝐀𝐃𝐎𝐑𝐄𝐒: {jugadores}\n")
    print("      𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔 1")
    for idx, player in enumerate(escuadra1, 1):
        if idx == 1:
            print(f"    👑 ┇ {player}")
        else:
            print(f"    🥷🏻 ┇ {player}")
    print("\n    ʚ 𝐒𝐔𝐏𝐋𝐄𝐍𝐓𝐄𝐒:")
    for suplente in suplentes:
        print(f"    🥷🏻 ┇ {suplente}")
    print("\n𝗣𝗔𝗥𝗧𝗜𝗖𝗜𝗣𝗔𝗡𝗧𝗘𝗦 𝗔𝗡𝗢𝗧𝗔𝗗𝗢𝗦:")
    if participantes_anotados:
        for p in participantes_anotados:
            print(f"{p}")
    else:
        print("Ninguno aún.")

# Ejemplo de uso:
mostrar_4vs4(
    hora_mexico="20:00",
    hora_colombia="21:00",
    modalidad="4vs4 FREE",
    jugadores="8",
    escuadra1=["Jugador1", "Jugador2", "Jugador3", "Jugador4"],
    suplentes=["Suplente1", "Suplente2"],
    participantes_anotados=[]
)