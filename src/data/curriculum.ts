import { World } from '../types';
import { RPG_IMAGES } from '../assets/rpgImages';

export const WORLDS: World[] = [
  // ==========================================
  // ACTO I: LA HUIDA DE LAS MAZMORRAS (SALIR DE LA MAZMORRA & EXPLORACIÓN)
  // Conceptos: Comandos secuenciales, Orientación, Variables numéricas y Salida
  // ==========================================
  {
    id: 'world_1',
    number: 1,
    actTitle: 'Acto I: La Huida de las Mazmorras',
    title: 'Acto I: Las Mazmorras de Algoritmia',
    subtitle: 'Exploración por Casillas, Salir de la Mazmorra y Secuencias',
    gameTheme: 'rover',
    themeColor: 'emerald',
    bgGradient: 'from-emerald-950/40 via-slate-900/60 to-slate-950',
    worldImage: RPG_IMAGES.dungeonCrawl,
    worldLore:
      'La partida de rol comienza en las frías catacumbas de piedra musgosa. Las antorchas parpadean en la pared húmeda. El Pícaro y la Exploradora deben coordinar sus pasos sin activar los fosos de pinchos, recolectar gemas de maná y guiar al grupo hasta la trampilla de salida hacia la superficie.',
    levels: [
      {
        id: 'w1_l1',
        worldId: 'world_1',
        title: 'Misión 1: Batalla en las Mazmorras (Tu Primer Combate)',
        subtitle: 'Órdenes tácticas: atacar, defenderse, cambiar arma o huir',
        description: 'Un Trasgo Guardián armado con un garrote bloquea el pasillo. Dirige a tu héroe en combate utilizando las acciones tácticas de Python: atacar, defenderse, cambiar arma o huir.',
        iconName: 'Sword',
        gameType: 'battle',
        rpgContext: {
          dmNarrative:
            '🎲 El Máster de Rol narra: "¡Iniciativa de combate! Un Trasgo de las Cavernas salta desde las sombras empuñando una maza herrumbrosa. Vuestro héroe desenvaina con rapidez. En tu turno dispones de 4 acciones de combate: personaje.atacar(), personaje.defenderse(), personaje.cambiar_arma(\\"espada\\") o personaje.huir(). ¡Elige tu táctica para resolver el encuentro!"',
          partyRole: 'El Guerrero de Vanguardia (Primer combatiente)',
          tacticalGoal: 'Derrotar al Trasgo combinando ataques y defensa, o ejecutar una retirada táctica con huir().',
          sceneImage: RPG_IMAGES.dungeonCrawl,
          diceCheck: '🎲 Tirada de Iniciativa y Ataque (CD 10): Maniobras de Combate',
        },
        tutorial: {
          conceptTitle: 'Llamadas a Funciones y Acciones del Personaje en Python',
          conceptSummary:
            'En un juego de rol programado en Python, tu personaje ejecuta acciones mediante llamadas a funciones escritas con su nombre, un punto y paréntesis: personaje.accion().',
          syntaxSnippet: 'personaje.atacar()\npersonaje.defenderse()\npersonaje.cambiar_arma("espada de acero")\npersonaje.huir()',
          codeExample:
            '# 1. Cambiamos a un arma de mayor poder ofensivo\npersonaje.cambiar_arma("espada de acero")\n\n# 2. Asestamos un ataque al enemigo\npersonaje.atacar()\n\n# 3. Levantamos el escudo para bloquear su golpe\npersonaje.defenderse()\n\n# 4. Asestamos el golpe de gracia\npersonaje.atacar()\n\n# (Nota: También puedes usar personaje.huir() para escapar tácticamente)',
          explanation:
            'Cada orden se ejecuta secuencialmente de arriba a abajo. Con cambiar_arma("nombre") le pasas entre comillas el arma que deseas equipar (como "espada", "hacha" o "arco"), lo que aumenta tu daño. defenderse() anula el próximo golpe del enemigo. Y si la situación se complica, huir() permite una retirada estratégica sin sufrir bajas.',
          keyPoints: [
            'personaje.atacar(): Golpea al enemigo con el arma equipada.',
            'personaje.defenderse(): Levanta el escudo para anular el contraataque enemigo.',
            'personaje.cambiar_arma("arma"): Equipa una nueva arma pasando su nombre entre comillas.',
            'personaje.huir(): Opción válida para escapar con una maniobra de humo.',
          ],
        },
        gameConfig: {
          gameType: 'battle',
          enemyName: 'Trasgo Guardián',
          enemyHp: 30,
          playerHp: 100,
          instructions:
            'Dirige a tu personaje en su primera batalla. Puedes cambiar de arma a "espada de acero" y atacar (defendiéndote cuando corresponda) hasta derrotar al Trasgo, o bien ordenar personaje.huir() para retirarte tácticamente.',
          objectives: [
            'Ejecutar las órdenes tácticas de combate de tu personaje.',
            'Vencer al Trasgo Guardián O realizar una huida táctica con personaje.huir().',
            'Mantener los puntos de vida de tu héroe por encima de 0 PV.',
          ],
          starterCode: `# Misión 1: Primera Batalla de Rol
# Acciones tácticas disponibles para tu personaje:
#   personaje.atacar()
#   personaje.defenderse()
#   personaje.cambiar_arma("espada")
#   personaje.huir()

# Equipamos una espada afilada y asestamos el primer golpe:
personaje.cambiar_arma("espada de acero")
personaje.atacar()

# TODO: Añade tu siguiente acción:
# ¿Quieres defenderte del golpe enemigo con personaje.defenderse(),
# atacar de nuevo con personaje.atacar(), o prefieres personaje.huir()?


`,
          solutionCode: `personaje.cambiar_arma("espada de acero")
personaje.atacar()
personaje.defenderse()
personaje.atacar()`,
          hints: [
            'El Trasgo tiene 30 PV. Tu arma inicial solo hace 12 de daño.',
            'Al hacer personaje.cambiar_arma("espada de acero"), tu daño sube a 20 PV por golpe.',
            'Usa personaje.defenderse() para bloquear el contraataque del enemigo.',
            '¡También puedes superar la misión ordenando personaje.huir() si prefieres una retirada táctica!',
          ],
        },
        xpReward: 60,
      },
      {
        id: 'w1_l2',
        worldId: 'world_1',
        title: 'Misión 2: Esquivar Fosos de Pinchos y Trampas',
        subtitle: 'Maniobras y giros en el laberinto subterráneo',
        description: 'El túnel de la mazmorra se retuerce con fosos mortales. Gira a izquierda y derecha para rescatar una gema sagrada y alcanzar la salida.',
        iconName: 'Compass',
        gameType: 'rover',
        rpgContext: {
          dmNarrative:
            '🎲 El Máster tira un dado tras la pantalla: "¡Escucháis un chasquido metálico! Una hilera de estacas envenenadas emerge frente a vosotros bloqueando el pasillo directo. Para rescatar la gema del santuario y alcanzar el portal de salida, deberéis realizar giros tácticos y rodear las trampas."',
          partyRole: 'La Exploradora Élfica (Especialista en trampas)',
          tacticalGoal: 'Orientar al personaje con giros a derecha e izquierda sin precipitarse a los fosos.',
          sceneImage: RPG_IMAGES.dungeonCrawl,
          diceCheck: '🎲 Tirada de Reflejos / Acrobacias (CD 12): Giros de Orientación',
        },
        tutorial: {
          conceptTitle: 'Orientación, Giros y Cuadrantes en Python',
          conceptSummary:
            'El héroe mantiene siempre una dirección en la brújula (Norte, Este, Sur, Oeste). Al llamar a girar_derecha() o girar_izquierda(), cambia hacia dónde mira sin desplazarse de casilla. Luego debes llamar a avanzar() para dar pasos en esa nueva dirección.',
          syntaxSnippet: 'explorador.girar_derecha()\nexplorador.avanzar()\nexplorador.girar_izquierda()',
          codeExample:
            '# Esquivar una esquina con pinchos:\nexplorador.avanzar()        # Avanza mirando al Este\nexplorador.girar_derecha()  # Ahora encara hacia el Sur\nexplorador.avanzar()        # Avanza hacia el Sur',
          explanation:
            'Girar cambia la orientación del personaje. Si quieres moverte en forma de L, debes avanzar, girar hacia el nuevo corredor y avanzar de nuevo.',
          keyPoints: [
            'girar_derecha() rota 90° en sentido de las agujas del reloj.',
            'girar_izquierda() rota 90° en sentido antihorario.',
            'Recuerda avanzar después de girar para caminar en la nueva dirección.',
          ],
        },
        gameConfig: {
          gameType: 'rover',
          instructions:
            'Guía al personaje: 1. Avanza 2 casillas al Este. 2. Gira al Norte (izquierda) y avanza para recoger la gema. 3. Gira al Este (derecha) y avanza para salir de la mazmorra.',
          objectives: [
            'Esquivar los fosos de pinchos de la cripta.',
            'Recoger la gema sagrada en la casilla (2, 1).',
            'Alcanzar la trampilla de salida en (4, 1).',
          ],
          starterCode: `# Misión 2: Esquivar trampas girando por los pasadizos
# El explorador empieza en (0, 2) mirando al Este:

explorador.avanzar()
explorador.avanzar()

# TODO: Gira a la izquierda para mirar al Norte y avanza hacia la gema:
explorador.girar_izquierda()
explorador.avanzar()
explorador.recoger()

# TODO: Ahora gira a la derecha hacia el Este y avanza hasta la salida:

`,
          solutionCode: `explorador.avanzar()
explorador.avanzar()
explorador.girar_izquierda()
explorador.avanzar()
explorador.recoger()
explorador.girar_derecha()
explorador.avanzar()
explorador.avanzar()`,
          hints: [
            'Tras recoger la gema en (2, 1), gira a la derecha para mirar al Este.',
            'Avanza dos casillas hacia adelante para cruzar la trampilla en (4, 1).',
          ],
          gridWidth: 5,
          gridHeight: 5,
          roverStart: { x: 0, y: 2, dir: 'E' },
          crystals: [{ id: 'c1', x: 2, y: 1 }],
          obstacles: [
            { x: 2, y: 2, type: 'crater' },
            { x: 3, y: 2, type: 'crater' },
          ],
          baseStation: { x: 4, y: 1 },
          maxSteps: 15,
        },
        xpReward: 60,
      },
      {
        id: 'w1_l3',
        worldId: 'world_1',
        title: 'Misión 3: La Balista Rúnica de la Muralla',
        subtitle: 'Variables numéricas y fórmulas arcanas de tiro',
        description: 'Al salir de la mazmorra a las almenas exteriores, dos gárgolas de piedra se abalanzan en vuelo. Calibra la balista con la fórmula de impacto.',
        iconName: 'Zap',
        gameType: 'cannon',
        rpgContext: {
          dmNarrative:
            '🎲 El Máster declara: "Al emerger de la trampilla, el aire fresco de la noche os golpea el rostro: ¡habéis salido de la mazmorra! Sin embargo, desde la torre oscura se alzan dos gárgolas con alas de piedra a distancias de 30 y 60 metros. Vuestro artillero debe cargar la balista rúnica aplicando la fórmula: potencia = distancia * 2 + 10."',
          partyRole: 'El Artillero Enano y la Maga de Asedio',
          tacticalGoal: 'Calcular la potencia con operadores matemáticos y abatir a las dos gárgolas con disparar(distancia, potencia).',
          sceneImage: RPG_IMAGES.armoryWeapons,
          diceCheck: '🎲 Tirada de Puntería y Balística Mágica (CD 14): Variables y Operadores',
        },
        tutorial: {
          conceptTitle: 'Variables y Operadores Matemáticos (+, -, *, /, //, %)',
          conceptSummary:
            'En Python almacenamos valores en variables usando el operador de asignación =. Podemos realizar cálculos arcanos combinando números y variables con operadores aritméticos.',
          syntaxSnippet: 'distancia = 50\npotencia = distancia * 2 + 10\nprint(f"Potencia mágica: {potencia}")',
          codeExample:
            '# Calibrar tiro de balista mágica:\ndistancia = 40\npotencia = (distancia * 2) + 10\ndisparar(distancia, potencia)',
          explanation:
            'La función disparar(distancia, potencia) necesita la distancia exacta y la potencia calculada para que el proyectil encantado pulverice a la criatura en pleno vuelo.',
          keyPoints: [
            '* multiplica, + suma, / divide con decimales.',
            'Las variables permiten reutilizar cálculos en diferentes situaciones.',
            'f-strings f"Texto {variable}" insertan valores dentro de cadenas de texto.',
          ],
        },
        gameConfig: {
          gameType: 'cannon',
          instructions:
            'La balista detecta 2 gárgolas enemigas a distancias de 30 m y 60 m. La fórmula arcana de tiro es: potencia = distancia * 2 + 10. Calcula ambas potencias y efectúa los dos disparos con disparar(distancia, potencia).',
          objectives: [
            'Calcular la potencia para la primera gárgola a 30 metros.',
            'Calcular la potencia para la segunda gárgola a 60 metros.',
            'Derribar a ambas gárgolas con la balista rúnica.',
          ],
          starterCode: `# Misión 3: Calibrar la Balista Rúnica contra las Gárgolas
# Fórmula mágica: potencia = distancia * 2 + 10

# Gárgola Alfa (distancia 30 metros):
dist_alfa = 30
potencia_alfa = dist_alfa * 2 + 10
disparar(dist_alfa, potencia_alfa)

# TODO: Calcula la potencia y dispara a la Gárgola Beta (distancia 60 metros):
dist_beta = 60
# Escribe la fórmula para potencia_beta y llama a disparar(dist_beta, potencia_beta):

`,
          solutionCode: `dist_alfa = 30
potencia_alfa = dist_alfa * 2 + 10
disparar(dist_alfa, potencia_alfa)

dist_beta = 60
potencia_beta = dist_beta * 2 + 10
disparar(dist_beta, potencia_beta)`,
          hints: [
            'Escribe: potencia_beta = dist_beta * 2 + 10.',
            'Llama a disparar(dist_beta, potencia_beta) a continuación.',
          ],
          asteroids: [
            { id: 'ast1', name: 'Gárgola de bajo rango', distance: 30, hp: 70 },
            { id: 'ast2', name: 'Gárgola de nivel 3', distance: 60, hp: 130 },
          ],
        },
        xpReward: 70,
      },
    ],
  },

  // ==========================================
  // ACTO II: LA ARMERÍA Y LA GUARDIA DE LA FORTALEZA
  // Conceptos: Decisiones booleanas, if, elif, else, and, or, not
  // ==========================================
  {
    id: 'world_2',
    number: 2,
    actTitle: 'Acto II: La Armería y la Guardia',
    title: 'Acto II: La Puerta de la Guardia y Armería',
    subtitle: 'Seleccionar Armas y Condiciones Booleanas if/elif/else',
    gameTheme: 'gatekeeper',
    themeColor: 'cyan',
    bgGradient: 'from-cyan-950/40 via-slate-900/60 to-slate-950',
    worldImage: RPG_IMAGES.armoryWeapons,
    worldLore:
      'El grupo cruza el patio de armas hacia la ciudadela interior. Para superar el rastrillo vigilado por un Centinela Gólem y seleccionar las armas más eficaces contra cada criatura, los aventureros deben aplicar la lógica condicional con if, elif y else.',
    levels: [
      {
        id: 'w2_l1',
        worldId: 'world_2',
        title: 'Misión 4: El Centinela de la Puerta de Hierro',
        subtitle: 'Condicionales simples: if y else',
        description: 'El Centinela Gólem vigila el paso a la fortaleza. Permite cruzar a los aliados de la partida y baja el rastrillo ante espías y monstruos.',
        iconName: 'ShieldAlert',
        gameType: 'gatekeeper',
        rpgContext: {
          dmNarrative:
            '🎲 El Máster describe la imponente puerta: "Un gólem de granito de 4 metros custodia el rastrillo de hierro. Sus ojos de rubí escanean a cada viajero: si el viajero es un aliado de la orden (visitante.es_aliado), el gólem levanta el rastrillo; si es un intruso, cierra el paso de inmediato."',
          partyRole: 'El Paladín de la Orden (Líder Diplomático)',
          tacticalGoal: 'Controlar el rastrillo abriendo la puerta a los aliados y bloqueando a intrusos hostiles.',
          sceneImage: RPG_IMAGES.armoryWeapons,
          diceCheck: '🎲 Tirada de Intuición y Lógica (CD 12): Condicionales if / else',
        },
        tutorial: {
          conceptTitle: 'Toma de Decisiones con if y else en Rol',
          conceptSummary:
            'El condicional if permite que el juego bifurque su comportamiento según la situación. Si la condición tras el if es verdadera (True), se ejecuta su bloque con sangría (4 espacios). Si es falsa (False), se ejecuta el bloque del else:.',
          syntaxSnippet: 'if visitante.es_aliado:\n    compuerta.abrir(visitante)\nelse:\n    compuerta.bloquear(visitante)',
          codeExample:
            '# Protocolo del centinela de la puerta:\nif visitante.es_aliado:\n    print(f"Bienvenido al castillo, {visitante.nombre}")\n    compuerta.abrir(visitante)\nelse:\n    print(f"¡Alto! Acceso denegado a {visitante.nombre}")\n    compuerta.bloquear(visitante)',
          explanation:
            '¡No olvides los dos puntos (:) obligatorios al final de la línea del if y del else, y la sangría de 4 espacios dentro de cada bloque de código!',
          keyPoints: [
            'if condición: comprueba si la afirmación es verdadera (True).',
            'else: recoge todas las situaciones donde la condición fue falsa (False).',
            'La indentación (sangría) delimita qué órdenes pertenecen a cada caso.',
          ],
        },
        gameConfig: {
          gameType: 'gatekeeper',
          instructions:
            'Examina la fila de viajeros. Si visitante.es_aliado es True, llama a compuerta.abrir(visitante); de lo contrario, bloquéalo con compuerta.bloquear(visitante).',
          objectives: [
            'Permitir el paso a todos los caballeros y clérigos aliados.',
            'Bloquear el acceso a trasgos y espías disfrazados.',
            'Procesar a todos los personajes en la fila.',
          ],
          starterCode: `# Misión 4: Filtrar a los viajeros frente a la puerta del castillo
for visitante in visitantes:
    # Comprueba si el personaje es un aliado:
    if visitante.es_aliado:
        compuerta.abrir(visitante)
    else:
        # TODO: Bloquea a los no aliados usando compuerta.bloquear(visitante)
        pass
`,
          solutionCode: `for visitante in visitantes:
    if visitante.es_aliado:
        compuerta.abrir(visitante)
    else:
        compuerta.bloquear(visitante)`,
          hints: [
            'Reemplaza pass en el bloque else por compuerta.bloquear(visitante).',
            'Respeta los 8 espacios de sangría para que el código quede dentro del else.',
          ],
          visitors: [
            { id: 'v1', name: 'Sir Galahad', role: 'Caballero Aliado', avatar: '🛡️', isAlly: true, clearanceLevel: 4, hasVirus: false, hasContraband: false, expectedAction: 'allow' },
            { id: 'v2', name: 'Trasgo Disfrazado', role: 'Espía Enemigo', avatar: '👺', isAlly: false, clearanceLevel: 1, hasVirus: false, hasContraband: false, expectedAction: 'block' },
            { id: 'v3', name: 'Hermana Beatrice', role: 'Clériga Aliada', avatar: '🧙‍♀️', isAlly: true, clearanceLevel: 3, hasVirus: false, hasContraband: false, expectedAction: 'allow' },
            { id: 'v4', name: 'Nigromante Mercer', role: 'Hechicero Proscrito', avatar: '💀', isAlly: false, clearanceLevel: 0, hasVirus: false, hasContraband: false, expectedAction: 'block' },
          ],
        },
        xpReward: 70,
      },
      {
        id: 'w2_l2',
        worldId: 'world_2',
        title: 'Misión 5: Seleccionar Armas y Filtro Rúnico',
        subtitle: 'Condicionales múltiples con elif y operador and',
        description: 'En el patio de armas, la guardia examina las auras: activa la alarma ante maldiciones oscuras y autoriza a héroes veteranos (nivel >= 3).',
        iconName: 'Flame',
        gameType: 'gatekeeper',
        rpgContext: {
          dmNarrative:
            '🎲 El Máster consulta las tablas de combate: "La guardia mágica tiene un estricto protocolo de seguridad: 1. Si un aventurero porta una maldición o plaga oscura (visitante.tiene_virus), ¡haced sonar la alarma rúnica de inmediato! 2. Si es un aliado probado y su nivel es >= 3, abrid las puertas. 3. Al resto de reclutas novatos o sospechosos, mantenedlos bloqueados fuera."',
          partyRole: 'El Maestro de Armas y la Alta Clériga',
          tacticalGoal: 'Activar alarma rúnica ante maldiciones y dar acceso solo a aliados de alto nivel.',
          sceneImage: RPG_IMAGES.armoryWeapons,
          diceCheck: '🎲 Tirada de Saber Arcano y Táctica (CD 15): Lógica Booleana con elif y and',
        },
        tutorial: {
          conceptTitle: 'Múltiples Opciones con elif y Operadores Lógicos',
          conceptSummary:
            'Cuando hay más de dos posibles resultados, usamos elif (abreviatura de else if). Python comprueba las opciones en orden: la primera condición verdadera ejecuta su bloque y descarta el resto.',
          syntaxSnippet: 'if visitante.tiene_virus:\n    alarma.activar(visitante)\nelif visitante.es_aliado and visitante.nivel >= 3:\n    compuerta.abrir(visitante)\nelse:\n    compuerta.bloquear(visitante)',
          codeExample:
            '# Jerarquía de selección en la guardia:\nif visitante.tiene_virus:\n    alarma.activar(visitante)  # Máxima prioridad ante plagas\nelif visitante.es_aliado and visitante.nivel >= 3:\n    compuerta.abrir(visitante)  # Héroe veterano autorizado\nelse:\n    compuerta.bloquear(visitante)  # Bloqueo preventivo',
          explanation:
            'El operador and exige que ambas condiciones se cumplan simultáneamente (ser aliado Y tener nivel >= 3). El primer if protege a la fortaleza de maldiciones antes de considerar otros casos.',
          keyPoints: [
            'elif solo se evalúa si las condiciones anteriores fueron falsas.',
            'and conecta dos requisitos obligatorios a la vez.',
            'alarma.activar() defiende la fortaleza ante peligros mayores.',
          ],
        },
        gameConfig: {
          gameType: 'gatekeeper',
          instructions:
            'Protocolo de la guardia: 1. Si visitante.tiene_virus es True, activa la alarma con alarma.activar(visitante). 2. Si es_aliado y su nivel es >= 3, abre la puerta. 3. En cualquier otro caso, bloquea con compuerta.bloquear(visitante).',
          objectives: [
            'Activar alarma ante portadores de peste o maldiciones oscuras.',
            'Permitir solo a aliados con nivel de veteranía >= 3.',
            'Bloquear a aspirantes con credenciales insuficientes.',
          ],
          starterCode: `# Misión 5: Protocolo de la Guardia con elif y operador and
for visitante in visitantes:
    # 1. ¿Porta una maldición oscura? Alarma rúnica inmediata:
    if visitante.tiene_virus:
        alarma.activar(visitante)
    # 2. ¿Es aliado y cuenta con nivel de veteranía >= 3?
    elif visitante.es_aliado and visitante.nivel >= 3:
        compuerta.abrir(visitante)
    # 3. Resto de casos: Bloquear
    else:
        # TODO: Bloquea al visitante con compuerta.bloquear(visitante)
        pass
`,
          solutionCode: `for visitante in visitantes:
    if visitante.tiene_virus:
        alarma.activar(visitante)
    elif visitante.es_aliado and visitante.nivel >= 3:
        compuerta.abrir(visitante)
    else:
        compuerta.bloquear(visitante)`,
          hints: [
            'Completa el bloque else con compuerta.bloquear(visitante).',
            'Comprueba cómo evaluar primero la maldición evita infiltraciones en la guardia.',
          ],
          visitors: [
            { id: 'v1', name: 'Archimago Elrond', role: 'Comandante Aliado (Nivel 5)', avatar: '🧙‍♂️', isAlly: true, clearanceLevel: 5, hasVirus: false, hasContraband: false, expectedAction: 'allow' },
            { id: 'v2', name: 'Gárgola Infectada', role: 'Monstruo con Peste Oscura', avatar: '☣️', isAlly: true, clearanceLevel: 4, hasVirus: true, hasContraband: false, expectedAction: 'alarm' },
            { id: 'v3', name: 'Escudero Novato', role: 'Cadete Aprendiz (Nivel 1)', avatar: '🧑‍🌾', isAlly: true, clearanceLevel: 1, hasVirus: false, hasContraband: false, expectedAction: 'block' },
            { id: 'v4', name: 'Espectro Corruptor', role: 'Ente Maldito Infiltrado', avatar: '👻', isAlly: false, clearanceLevel: 0, hasVirus: true, hasContraband: false, expectedAction: 'alarm' },
          ],
        },
        xpReward: 80,
      },
    ],
  },

  // ==========================================
  // ACTO III: LAS MINAS SUBTERRÁNEAS DE MITHRIL
  // Conceptos: Bucles for, range(), bucles while y control de flujo
  // ==========================================
  {
    id: 'world_3',
    number: 3,
    actTitle: 'Acto III: Las Minas Subterráneas',
    title: 'Acto III: Las Minas Enanas de Mithril',
    subtitle: 'Automatización con Bucles for y while en las Galerías',
    gameTheme: 'miner',
    themeColor: 'amber',
    bgGradient: 'from-amber-950/40 via-slate-900/60 to-slate-950',
    worldImage: RPG_IMAGES.crystalMines,
    worldLore:
      'Para forjar la armadura y el escudo ignífugo necesarios contra el Dragón Ancestral, el herrero enano necesita mithril puro. El grupo desciende a los túneles subterráneos para programar autómatas mineros mediante bucles de repetición.',
    levels: [
      {
        id: 'w3_l1',
        worldId: 'world_3',
        title: 'Misión 6: El Autómata Enano de Mithril',
        subtitle: 'Repetición con bucle for y range()',
        description: 'Programa el pico mecánico del autómata enano para excavar una galería de 5 bloques de mithril usando un bucle for.',
        iconName: 'Repeat',
        gameType: 'miner',
        rpgContext: {
          dmNarrative:
            '🎲 El Máster coloca el mapa de las minas sobre la mesa: "Las vetas de mithril resplandecen en la roca oscura. El enano saca una llave de cuerda y os dice: ¡Programad al autómata minero con un bucle for range(5) para que pique y avance automáticamente por la veta sin que tengamos que picar a mano los 5 bloques!"',
          partyRole: 'El Ingeniero Enano y Artificiero',
          tacticalGoal: 'Automatizar con un bucle for range(5) la extracción continua de mineral de mithril.',
          sceneImage: RPG_IMAGES.crystalMines,
          diceCheck: '🎲 Tirada de Ingeniería Mecánica Enana (CD 12): Bucle for con range()',
        },
        tutorial: {
          conceptTitle: 'Repetición Automática con for y range() en Python',
          conceptSummary:
            'En lugar de copiar y pegar la misma orden de combate o excavación muchas veces, usamos un bucle for con range(n). La variable del bucle tomará los valores 0, 1, ..., hasta n - 1, ejecutando el bloque exactamente n veces.',
          syntaxSnippet: 'for paso in range(5):\n    minero.picar()\n    minero.avanzar()',
          codeExample:
            '# Picar y avanzar 4 veces:\nfor i in range(4):\n    print(f"Extrayendo bloque de mithril número {i + 1}")\n    minero.picar()    # Pica la veta con el pico rúnico\n    minero.avanzar()  # Da un paso hacia la siguiente veta',
          explanation:
            'range(5) genera 5 iteraciones exactas. Todo el código indentado dentro del cuerpo del for se repetirá automáticamente en cada vuelta del bucle.',
          keyPoints: [
            'range(5) repite el bloque 5 veces consecutivas.',
            'paso es la variable contadora que va cambiando en cada vuelta.',
            'Ahorra líneas de código y previene errores humanos en tareas repetitivas.',
          ],
        },
        gameConfig: {
          gameType: 'miner',
          instructions:
            'Hay 5 vetas seguidas de mineral de mithril en el túnel. Usa un bucle for paso in range(5): para llamar a minero.picar() y luego minero.avanzar() en cada paso.',
          objectives: [
            'Excavar los 5 bloques de mithril de la galería.',
            'Recolectar al menos 5 cristales para la forja.',
            'Utilizar un bucle for range(5) en lugar de órdenes repetidas a mano.',
          ],
          starterCode: `# Misión 6: Automatizar la extracción de mithril con for y range()
# Usa un bucle for para repetir 5 veces la acción de picar y avanzar:

for paso in range(5):
    minero.picar()
    # TODO: Avanza hacia el siguiente bloque con minero.avanzar()
    
`,
          solutionCode: `for paso in range(5):
    minero.picar()
    minero.avanzar()`,
          hints: [
            'Añade minero.avanzar() con 4 espacios de sangría justo debajo de minero.picar().',
            'Al repetirse 5 veces, el autómata limpiará todo el corredor.',
          ],
          initialBattery: 100,
          targetCrystals: 5,
          veins: [
            { depth: 1, crystals: 1 },
            { depth: 2, crystals: 1 },
            { depth: 3, crystals: 1 },
            { depth: 4, crystals: 1 },
            { depth: 5, crystals: 1 },
          ],
        },
        xpReward: 80,
      },
      {
        id: 'w3_l2',
        worldId: 'world_3',
        title: 'Misión 7: Extracción en las Profundidades Oscuras',
        subtitle: 'Bucles condicionales con while',
        description: 'Excava la caverna mientras las antorchas mágicas del autómata tengan maná (> 20) y la vagoneta no esté llena.',
        iconName: 'Zap',
        gameType: 'miner',
        rpgContext: {
          dmNarrative:
            '🎲 El Máster lanza un dado de tensión: "Descendéis a un pozo más profundo. Las antorchas mágicas iluminan la galería subterránea. El autómata debe picar mientras su reserva de maná no baje del 20% (minero.mana > 20) y la vagoneta de transporte tenga espacio (not minero.vagoneta_llena)."',
          partyRole: 'La Artificiera de la Partida de Rol',
          tacticalGoal: 'Gestionar el bucle while para recolectar el máximo mineral antes de agotar la reserva de maná.',
          sceneImage: RPG_IMAGES.crystalMines,
          diceCheck: '🎲 Tirada de Concentración Mágica (CD 14): Bucle while condicional',
        },
        tutorial: {
          conceptTitle: 'El Bucle while: Repetir Mientras una Condición sea Verdadera',
          conceptSummary:
            'A diferencia del bucle for (que se repite un número predeterminado de veces), el bucle while se repite mientras su condición sea True. Es ideal cuando no sabemos de antemano cuántos pasos daremos o dependemos de recursos del juego.',
          syntaxSnippet: 'while minero.mana > 20 and not minero.vagoneta_llena:\n    minero.picar()\n    minero.avanzar()',
          codeExample:
            '# Minería mágica con antorchas arcanas:\nwhile minero.mana > 15:\n    print(f"Maná restante: {minero.mana}%")\n    minero.picar()\n    minero.avanzar()',
          explanation:
            '¡Cuidado con los bucles infinitos! Dentro del cuerpo del while debe ocurrir algo que eventualmente haga la condición False (como gastar maná o llenar la vagoneta).',
          keyPoints: [
            'while condición: evalúa la condición antes de cada vuelta.',
            'Si la condición es False desde el inicio, el bucle ni siquiera entra.',
            'not minero.vagoneta_llena comprueba que aún queda espacio para mineral.',
          ],
        },
        gameConfig: {
          gameType: 'miner',
          instructions:
            'Escribe un bucle while que funcione mientras minero.mana > 20 y no esté llena la vagoneta (not minero.vagoneta_llena). Dentro del bucle, pica y avanza.',
          objectives: [
            'Picar cristales mientras minero.mana > 20.',
            'Detener la extracción antes de agotar la reserva de maná de las antorchas.',
            'Llenar la vagoneta de transporte con el botín.',
          ],
          starterCode: `# Misión 7: Bucle while con antorchas mágicas
# Completa la condición del bucle while y añade la orden para avanzar:
# 1) Reemplaza '___' por el umbral de maná mínimo (20)
# 2) Añade la instrucción para que el autómata avance: minero.avanzar()

while minero.mana > ___ and not minero.vagoneta_llena:
    minero.picar()
    # Escribe aquí la orden que falta para avanzar:
    

print("¡Extracción finalizada con antorchas encendidas!")
`,
          solutionCode: `while minero.mana > 20 and not minero.vagoneta_llena:
    minero.picar()
    minero.avanzar()`,
          hints: [
            'Reemplaza ___ por el número 20 en la condición del while.',
            'Escribe minero.avanzar() dentro del while con 4 espacios de sangrado.',
          ],
          initialBattery: 100,
          targetCrystals: 6,
          veins: [
            { depth: 1, crystals: 1 },
            { depth: 2, crystals: 2 },
            { depth: 3, crystals: 1 },
            { depth: 4, crystals: 2 },
            { depth: 5, crystals: 1 },
          ],
        },
        xpReward: 90,
      },
    ],
  },

  // ==========================================
  // ACTO IV: EL INVENTARIO DEL HÉROE Y LOS COFRES DEL TESORO
  // Conceptos: Listas [], .append(), in, .remove(), len(), índices
  // ==========================================
  {
    id: 'world_4',
    number: 4,
    actTitle: 'Acto IV: La Mochila del Aventurero',
    title: 'Acto IV: El Inventario y los Cofres Legendarios',
    subtitle: 'Listas en Python, Métodos de Mochila (.append/.remove) y Llaves',
    gameTheme: 'inventory',
    themeColor: 'purple',
    bgGradient: 'from-purple-950/40 via-slate-900/60 to-slate-950',
    worldImage: RPG_IMAGES.treasureLoot,
    worldLore:
      'En la cámara secreta de las reliquias, los aventureros descubren antiguos cofres con cerrojos rúnicos. Para abrirlos y prepararse para el combate final, deben gestionar su mochila en Python: guardar armas encantadas, purgar pociones venenosas y portar la llave dorada.',
    levels: [
      {
        id: 'w4_l1',
        worldId: 'world_4',
        title: 'Misión 8: Equipar la Mochila y Abrir el Cofre',
        subtitle: 'Listas [], método .append() y comprobación in',
        description: 'Añade a tu mochila el "anillo_de_teletransporte", la "pocion_vida" y la "llave_dorada". Luego, si la "llave_dorada" está en tu mochila, abre el cofre legendario.',
        iconName: 'Package',
        gameType: 'inventory',
        rpgContext: {
          dmNarrative:
            '🎲 El Máster sonríe enigmático: "Frente a vosotros se alza el gran Cofre de Ébano tallado con runas de oro. Vuestra mochila de aventurero empieza vacía ([]). Para acceder al botín legendario debéis recoger el anillo_de_teletransporte, la pocion_vida y la llave_dorada con .append(). Si la llave dorada está en vuestro poder, el cofre se abrirá."',
          partyRole: 'El Saqueador de Mazmorras y el Pícaro',
          tacticalGoal: 'Añadir los tres ítems al inventario con mochila.append() y desbloquear el cofre con cofre.abrir().',
          sceneImage: RPG_IMAGES.treasureLoot,
          diceCheck: '🎲 Tirada de Juego de Manos / Cerrajería (CD 13): Listas y .append()',
        },
        tutorial: {
          conceptTitle: 'Listas en Python: La Mochila del Aventurero',
          conceptSummary:
            'Una lista es una colección ordenada y mutable de elementos. Se crea encerrando elementos entre corchetes [] separados por comas. Para guardar un nuevo objeto en el inventario usamos el método lista.append(objeto).',
          syntaxSnippet: 'mochila = []\nmochila.append("pocion")\nif "llave_dorada" in mochila:\n    cofre.abrir()',
          codeExample:
            '# Gestión de inventario de rol:\nmochila = ["antorcha"]\nmochila.append("anillo_de_teletransporte")\nmochila.append("llave_dorada")\n\nif "llave_dorada" in mochila:\n    print("¡La llave encaja en el cerrojo!")\n    cofre.abrir()',
          explanation:
            'El operador in comprueba de forma natural si un elemento está dentro de una lista, devolviendo True o False. Es la forma más limpia de verificar si el héroe posee el objeto necesario.',
          keyPoints: [
            'Las listas se definen con corchetes [].',
            'mochila.append(item) añade un objeto al final del inventario.',
            'El operador in comprueba si el objeto existe en la mochila.',
          ],
        },
        gameConfig: {
          gameType: 'inventory',
          instructions:
            'Añade a tu mochila el "anillo_de_teletransporte", la "pocion_vida" y la "llave_dorada". Luego, si la "llave_dorada" está en tu mochila, abre el cofre del tesoro con cofre.abrir().',
          objectives: [
            'Añadir "anillo_de_teletransporte" al inventario.',
            'Añadir "pocion_vida" al inventario.',
            'Añadir "llave_dorada" al inventario.',
            'Abrir el cofre legendario con cofre.abrir().',
          ],
          starterCode: `# Misión 8: Manipular el inventario con listas y .append()
# Tu mochila empieza vacía:
mochila = []

# 1. Añade los objetos necesarios para la aventura:
mochila.append("anillo_de_teletransporte")
mochila.append("pocion_vida")
# TODO: Añade la "llave_dorada" a la mochila con .append():


# 2. Si la "llave_dorada" está en la mochila, abre el cofre:
if "llave_dorada" in mochila:
    cofre.abrir()
`,
          solutionCode: `mochila = []
mochila.append("anillo_de_teletransporte")
mochila.append("pocion_vida")
mochila.append("llave_dorada")

if "llave_dorada" in mochila:
    cofre.abrir()`,
          hints: [
            'Escribe mochila.append("llave_dorada").',
            'El operador in comprueba si un elemento existe dentro de la lista.',
          ],
          initialInventory: [],
          targetInventory: ['anillo_de_teletransporte', 'pocion_vida', 'llave_dorada'],
          availableChests: [
            { id: 'chest1', requiredKey: 'llave_dorada', reward: 'Armadura Mágica +500 XP' },
          ],
        },
        xpReward: 90,
      },
      {
        id: 'w4_l2',
        worldId: 'world_4',
        title: 'Misión 9: El Botín Maldito: Purgar el Veneno',
        subtitle: 'Eliminar elementos con .remove() e inspección con len()',
        description: 'Se ha colado un frasco con veneno mortal de mantícora en tu mochila. Elimínalo con .remove() y verifica que queden exactamente 3 objetos seguros.',
        iconName: 'Bug',
        gameType: 'inventory',
        rpgContext: {
          dmNarrative:
            '🎲 El Máster arquea una ceja y describe la escena: "Al revisar el botín del cofre descubrís que entre vuestras provisiones (escudo, veneno, rubi, mapa) una botella destila un vapor verdoso y letal: ¡veneno de mantícora! Vuestra clériga debe purgarlo inmediatamente con mochila.remove(\'veneno\') antes de que contamine el resto del equipo."',
          partyRole: 'La Alquimista y Clériga Curandera',
          tacticalGoal: 'Comprobar la presencia del veneno con \'in\', eliminarlo con .remove() y comprobar que queden 3 objetos.',
          sceneImage: RPG_IMAGES.treasureLoot,
          diceCheck: '🎲 Tirada de Medicina / Alquimia (CD 14): Métodos de Listas y len()',
        },
        tutorial: {
          conceptTitle: 'Eliminar Objetos de la Mochila y Contar con len()',
          conceptSummary:
            'Para borrar un objeto específico de una lista por su nombre usamos lista.remove(valor). Además, con la función len(lista) podemos saber cuántos objetos quedan dentro de la mochila.',
          syntaxSnippet: 'if "veneno" in mochila:\n    mochila.remove("veneno")\nprint(len(mochila))',
          codeExample:
            '# Purgar objetos malditos:\nif "veneno" in mochila:\n    mochila.remove("veneno")\nprint(f"Objetos seguros restantes: {len(mochila)}")',
          explanation:
            'Si intentas llamar a .remove() con un elemento que no existe, Python lanzará un error. Por eso es una excelente práctica de aventurero verificar primero con if elemento in lista:.',
          keyPoints: [
            'lista.remove(item) busca y elimina la primera coincidencia.',
            'in previene errores antes de intentar borrar.',
            'len(lista) devuelve un número entero con la cantidad de ítems.',
          ],
        },
        gameConfig: {
          gameType: 'inventory',
          instructions:
            'Tu mochila actual contiene: ["escudo", "veneno", "rubi", "mapa"]. Comprueba si "veneno" está en la mochila y elimínalo usando mochila.remove("veneno").',
          objectives: [
            'Eliminar el "veneno" mortal de la mochila.',
            'Conservar el "escudo", el "rubi" y el "mapa".',
            'Asegurar que el tamaño final de la mochila sea exactamente 3.',
          ],
          starterCode: `# Misión 9: Limpieza de inventario en la mazmorra
mochila = ["escudo", "veneno", "rubi", "mapa"]

# TODO: Comprueba si "veneno" está en la mochila y bórralo con .remove()
if "veneno" in mochila:
    # Completa aquí la instrucción para eliminar el frasco venenoso:
    pass

print(f"Mochila purificada con {len(mochila)} objetos seguros")
`,
          solutionCode: `mochila = ["escudo", "veneno", "rubi", "mapa"]
if "veneno" in mochila:
    mochila.remove("veneno")`,
          hints: [
            'mochila.remove("veneno") elimina el frasco venenoso del inventario.',
          ],
          initialInventory: ['escudo', 'veneno', 'rubi', 'mapa'],
          targetInventory: ['escudo', 'rubi', 'mapa'],
          disallowedItems: ['veneno'],
        },
        xpReward: 100,
      },
    ],
  },

  // ==========================================
  // ACTO V: EL ASALTO FINAL AL DRAGÓN ANCESTRAL
  // Conceptos: Creación de funciones con def, parámetros, return vs print, y algoritmo de combate
  // ==========================================
  {
    id: 'world_5',
    number: 5,
    actTitle: 'Acto V: El Asalto Final al Dragón',
    title: 'Acto V: El Dragón Ancestral de Algoritmia',
    subtitle: 'Funciones Modulares def, Parámetros y Tiradas Críticas d20',
    gameTheme: 'boss_battle',
    themeColor: 'rose',
    bgGradient: 'from-rose-950/40 via-slate-900/60 to-slate-950',
    worldImage: RPG_IMAGES.dragonBoss,
    worldLore:
      'El clímax épico de la campaña de rol. Los aventureros ascienden a la cámara del cráter volcánico donde el Dragón Rojo Ancestral custodia el tesoro de Algoritmia. Solo combinando funciones modulares, parámetros de fuerza y multiplicadores de golpe crítico lograrán alzarse con la victoria.',
    levels: [
      {
        id: 'w5_l1',
        worldId: 'world_5',
        title: 'Misión 10: Forjando el Hechizo de Combate',
        subtitle: 'Definición de funciones con def y return',
        description: 'Define la función calcular_ataque(fuerza, escudo_boss) que devuelva el daño neto para traspasar los escudos del Centinela.',
        iconName: 'Cpu',
        gameType: 'boss_battle',
        rpgContext: {
          dmNarrative:
            '🎲 El Máster declara la iniciativa de combate: "El Centinela Gólem de Neón que protege la guarida del dragón interpone su escudo de energía. La maga del grupo debe condensar una fórmula de hechizo reutilizable definiendo def calcular_ataque(fuerza, escudo_boss) que devuelva el daño neto penetrando la armadura con return."',
          partyRole: 'La Archimaga de Batalla',
          tacticalGoal: 'Definir una función con def que calcule el daño (fuerza * 2 - escudo_boss) y lo entregue con return.',
          sceneImage: RPG_IMAGES.dragonBoss,
          diceCheck: '🎲 Tirada de Conjuración Arcana (CD 16): Creación de Funciones def',
        },
        tutorial: {
          conceptTitle: 'Funciones con def y la sentencia return en Rol',
          conceptSummary:
            'Las funciones empaquetan hechizos y bloques de cálculo para reutilizarlos en cualquier turno sin repetir código. Se definen con la palabra reservada def, seguida del nombre y sus parámetros. Para devolver el resultado del daño al motor del juego usamos return.',
          syntaxSnippet: 'def calcular_dano(potencia, escudo):\n    dano_neto = potencia * 2 - escudo\n    return dano_neto',
          codeExample:
            '# Hechizo de bola de fuego:\ndef conjurar_fuego(nivel_magia, resistencia):\n    dano = (nivel_magia * 3) - resistencia\n    return max(0, dano)\n\nimpacto = conjurar_fuego(10, 5)\nprint(f"Daño infligido: {impacto}")',
          explanation:
            '¡Diferencia vital entre return y print()! print() solo muestra texto en la consola, pero return devuelve el valor numérico para que el motor de combate del juego pueda restar la vida al jefe.',
          keyPoints: [
            'def nombre(parametro1, parametro2): declara la función.',
            'return envía el daño calculado de vuelta al motor de combate.',
            'El código dentro de la función se ejecuta cada vez que el juego la invoca.',
          ],
        },
        gameConfig: {
          gameType: 'boss_battle',
          instructions:
            'Crea una función llamada calcular_ataque(fuerza, escudo_boss) que calcule el daño total. Si la fuerza multiplicada por 2 es mayor que el escudo_boss, debe devolver (fuerza * 2) - escudo_boss; de lo contrario, debe devolver 0.',
          objectives: [
            'Declarar la función def calcular_ataque(fuerza, escudo_boss):',
            'Calcular el daño duplicando la fuerza y restando el escudo.',
            'Devolver el resultado con return.',
            'Derrotar al Centinela de Neón en la arena.',
          ],
          starterCode: `# Misión 10: Función de ataque contra el lugarteniente del Dragón
# Fórmula: (fuerza * 2) - escudo_boss

def calcular_ataque(fuerza, escudo_boss):
    dano = (fuerza * 2) - escudo_boss
    if dano > 0:
        return dano
    else:
        return 0

# El simulador de combate llamará a tu función automáticamente en cada ronda:
`,
          solutionCode: `def calcular_ataque(fuerza, escudo_boss):
    dano = (fuerza * 2) - escudo_boss
    if dano > 0:
        return dano
    else:
        return 0`,
          hints: [
            'Comprueba que la función se llame calcular_ataque con los parámetros fuerza y escudo_boss.',
            'Asegúrate de devolver el valor con return dano.',
          ],
          bossName: 'Centinela de Neón',
          bossHp: 80,
          bossShield: 10,
          bossAvatar: '🤖',
          playerHp: 100,
          roundsCount: 3,
        },
        xpReward: 120,
      },
      {
        id: 'w5_l2',
        worldId: 'world_5',
        title: 'Misión 11: La Batalla Final: ¡Golpe Crítico d20 contra el Dragón!',
        subtitle: 'El Gran Desafío Final: Ataques Críticos y Victoria de la Partida',
        description: 'Aplica todo lo aprendido en la partida de rol: programa la táctica de combate completa con multiplicador de golpe crítico para vencer al Dragón Ancestral.',
        iconName: 'Crown',
        gameType: 'boss_battle',
        isBoss: true,
        rpgContext: {
          dmNarrative:
            '🎲 El Máster se pone en pie y tira un dado d20 gigante sobre la mesa: "¡EL DRAGÓN ROJO GLITCH DESPLIEGA SUS COLOSALES ALAS DE LLAMA! Ruge haciendo temblar las columnas del templo. ¡Toda la campaña de rol depende de este turno! Si sacáis un 20 crítico (es_critico == True), vuestra fuerza se triplica antes de restar la armadura de escamas. ¡Programad la función definitiva y salvad el reino de Algoritmia!"',
          partyRole: 'Todo el Grupo de Rol en Cooperativo (Guerrero, Maga, Pícaro y Clériga)',
          tacticalGoal: 'Programar la función golpe_maestro con multiplicador crítico x3, restar la armadura y asestar el golpe de gracia.',
          sceneImage: RPG_IMAGES.dragonBoss,
          diceCheck: '🎲 ¡TIRADA FINAL DE INICIATIVA D20! (CD 18 - Dificultad Legendaria)',
        },
        tutorial: {
          conceptTitle: 'El Desafío Definitivo de Python y Rol',
          conceptSummary:
            '¡Has llegado a la batalla final de la partida! Aquí combinarás funciones, parámetros múltiples, condicionales if/else y cálculos matemáticos para dirigir a tu grupo de héroes hacia la victoria final.',
          syntaxSnippet: 'def golpe_maestro(fuerza, es_critico, armadura):\n    if es_critico:\n        fuerza = fuerza * 3\n    return fuerza - armadura',
          codeExample:
            '# Táctica de combate épico:\ndef calcular_impacto(ataque, es_critico, defensa):\n    multiplicador = 3 if es_critico else 1\n    return (ataque * multiplicador) - defensa',
          explanation:
            'Si logras programar la función con la lógica de críticos y reducción de armadura, tus aventureros asestarán los golpes definitivos para coronarse Leyendas de Python.',
          keyPoints: [
            'Aplica un multiplicador x3 a la fuerza cuando es_critico sea True.',
            'Resta la armadura del Dragón para obtener el daño final.',
            'Usa return para entregar el daño al motor de la batalla.',
            'Establece un estado para el enemigo final y simula un ataque final.'
          ],
        },
        gameConfig: {
          gameType: 'boss_battle',
          instructions:
            'Define la función def golpe_maestro(fuerza, es_critico, armadura):. Si es_critico es True, triplica la fuerza (fuerza * 3); de lo contrario, déjala igual. Luego resta la armadura y devuelve el resultado con return.',
          objectives: [
            'Crear def golpe_maestro(fuerza, es_critico, armadura):',
            'Multiplicar la fuerza x3 si es_critico es True (¡Tirada Crítica!).',
            'Restar la armadura del Dragón y devolver el daño con return.',
            'Derrotar al Dragón Rojo Glitch y completar la campaña de rol.',
          ],
          starterCode: `# Misión Final: Derrotar al Dragón Rojo Ancestral
# Estructura del Hechizo Legendario: golpe_maestro(fuerza, es_critico, armadura)

def golpe_maestro(fuerza, es_critico, armadura):
    # PASO 1: Si es_critico es True, triplica la fuerza (fuerza * 3).
    # En caso contrario (else), la fuerza se mantiene igual.
    
    
    # PASO 2: Resta la armadura del Dragón a la fuerza para calcular el daño:
    # dano = fuerza_total - armadura
    
    
    # PASO 3: Devuelve el daño final al combate usando 'return':
    
    pass

print("🎲 ¡El grupo de aventureros desenvaina sus armas ante el Dragón!")
`,
          solutionCode: `def golpe_maestro(fuerza, es_critico, armadura):
    if es_critico:
        fuerza_total = fuerza * 3
    else:
        fuerza_total = fuerza
    
    dano_final = fuerza_total - armadura
    return dano_final`,
          hints: [
            'Fíjate cómo el bloque if es_critico: triplica la fuerza_total.',
            'Pulsa "Probar y Testear" para ver la batalla por turnos en la arena épica.',
          ],
          bossName: 'Dragón Rojo Glitch',
          bossHp: 150,
          bossShield: 15,
          bossAvatar: '🐉',
          playerHp: 100,
          roundsCount: 4,
        },
        xpReward: 200,
      },
    ],
  },
];
