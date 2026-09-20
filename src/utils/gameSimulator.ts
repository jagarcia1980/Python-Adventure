import { Level, MiniGameConfig } from '../types';
import { runPythonCode, ExecutionResult } from './pythonRunner';

export interface GameSimulationEvent {
  time: number;
  type: string;
  message: string;
  payload?: any;
}

export interface SimulationOutcome {
  success: boolean;
  score: number; // 1 to 3 stars
  message: string;
  events: GameSimulationEvent[];
  terminalOutput: string;
  rawError?: string;
  finalState?: any;
}

export function simulateMiniGame(level: Level, userCode: string): SimulationOutcome {
  const events: GameSimulationEvent[] = [];
  const cfg = level.gameConfig;
  let eventTimer = 0;

  const pushEvent = (type: string, message: string, payload?: any) => {
    eventTimer += 1;
    events.push({
      time: eventTimer,
      type,
      message,
      payload,
    });
  };

  try {
    // -------------------------------------------------------------
    // GAME 1: ROVER EN MARTE
    // -------------------------------------------------------------
    if (level.gameType === 'rover') {
      const gridW = cfg.gridWidth || 5;
      const gridH = cfg.gridHeight || 5;
      let x = cfg.roverStart?.x ?? 0;
      let y = cfg.roverStart?.y ?? 2;
      let dir = cfg.roverStart?.dir ?? 'E';
      const collectedCrystals = new Set<string>();
      const obstacles = cfg.obstacles || [];
      const base = cfg.baseStation || { x: gridW - 1, y };
      let crashed = false;
      let crashReason = '';
      let stepsCount = 0;

      const DIRS = ['N', 'E', 'S', 'W'] as const;
      const DELTAS: Record<string, { dx: number; dy: number }> = {
        N: { dx: 0, dy: -1 },
        E: { dx: 1, dy: 0 },
        S: { dx: 0, dy: 1 },
        W: { dx: -1, dy: 0 },
      };

      const rover = {
        avanzar: () => {
          if (crashed) return;
          stepsCount++;
          const delta = DELTAS[dir];
          const nx = x + delta.dx;
          const ny = y + delta.dy;

          if (nx < 0 || nx >= gridW || ny < 0 || ny >= gridH) {
            crashed = true;
            crashReason = `¡El rover se salió de los límites marcianos en (${nx}, ${ny})!`;
            pushEvent('rover_crash', crashReason, { x, y, dir });
            return;
          }

          // Check obstacles
          const obstacleHit = obstacles.find((o) => o.x === nx && o.y === ny);
          if (obstacleHit) {
            crashed = true;
            crashReason = `¡El rover cayó en un ${obstacleHit.type === 'crater' ? 'cráter profundo' : 'campo de rocas'} en (${nx}, ${ny})!`;
            x = nx;
            y = ny;
            pushEvent('rover_crash', crashReason, { x, y, dir });
            return;
          }

          x = nx;
          y = ny;
          pushEvent('rover_move', `Rover avanzó a (${x}, ${y}) mirando al ${dir}`, { x, y, dir });
        },
        girar_derecha: () => {
          if (crashed) return;
          stepsCount++;
          const idx = DIRS.indexOf(dir as any);
          dir = DIRS[(idx + 1) % 4];
          pushEvent('rover_turn', `Rover giró a la derecha (ahora mira al ${dir})`, { x, y, dir });
        },
        girar_izquierda: () => {
          if (crashed) return;
          stepsCount++;
          const idx = DIRS.indexOf(dir as any);
          dir = DIRS[(idx + 3) % 4];
          pushEvent('rover_turn', `Rover giró a la izquierda (ahora mira al ${dir})`, { x, y, dir });
        },
        recoger: () => {
          if (crashed) return;
          stepsCount++;
          const found = (cfg.crystals || []).find((c) => c.x === x && c.y === y);
          if (found) {
            collectedCrystals.add(found.id);
            pushEvent('rover_collect', `¡Mineral cuántico recolectado en (${x}, ${y})!`, { x, y, id: found.id });
          } else {
            pushEvent('rover_empty_collect', `No hay ningún mineral en (${x}, ${y}) para recoger`, { x, y });
          }
        },
      };

      const result = runPythonCode(userCode, { rover, explorador: rover, picaro: rover, heroe: rover });
      if (!result.success) {
        return {
          success: false,
          score: 0,
          message: result.error || 'Error en la ejecución del código Python.',
          events,
          terminalOutput: result.output,
          rawError: result.error,
        };
      }

      if (crashed) {
        return {
          success: false,
          score: 0,
          message: crashReason,
          events,
          terminalOutput: result.output,
          finalState: { x, y, dir, collectedCount: collectedCrystals.size },
        };
      }

      const totalRequiredCrystals = cfg.crystals?.length || 0;
      const allCrystalsCollected = collectedCrystals.size >= totalRequiredCrystals;
      const reachedBase = x === base.x && y === base.y;

      if (!allCrystalsCollected) {
        return {
          success: false,
          score: 1,
          message: `Has recogido ${collectedCrystals.size} de ${totalRequiredCrystals} cristales. Asegúrate de pasar por cada cristal y llamar a rover.recoger().`,
          events,
          terminalOutput: result.output,
          finalState: { x, y, dir, collectedCount: collectedCrystals.size },
        };
      }

      if (!reachedBase) {
        return {
          success: false,
          score: 1,
          message: `¡Recogiste todos los cristales, pero el rover no llegó a la base en (${base.x}, ${base.y})! Se quedó en (${x}, ${y}).`,
          events,
          terminalOutput: result.output,
          finalState: { x, y, dir, collectedCount: collectedCrystals.size },
        };
      }

      pushEvent('rover_dock', '¡Rover acoplado con éxito en la plataforma base!');
      return {
        success: true,
        score: stepsCount <= (cfg.maxSteps || 20) ? 3 : 2,
        message: '¡Misión cumplida! Has recolectado todas las muestras y aparcado a salvo.',
        events,
        terminalOutput: result.output,
        finalState: { x, y, dir, collectedCount: collectedCrystals.size, completed: true },
      };
    }

    // -------------------------------------------------------------
    // GAME 2: EL CAÑÓN ORBITAL
    // -------------------------------------------------------------
    if (level.gameType === 'cannon') {
      const shots: { distance: number; power: number }[] = [];
      const disparar = (distancia: number, potencia: number) => {
        shots.push({ distance: Number(distancia), power: Number(potencia) });
        pushEvent('cannon_fire', `Disparo efectuado -> Distancia: ${distancia}km | Potencia: ${potencia}MW`, {
          distance: Number(distancia),
          power: Number(potencia),
        });
      };

      const result = runPythonCode(userCode, { disparar });
      if (!result.success) {
        return {
          success: false,
          score: 0,
          message: result.error || 'Error al ejecutar los cálculos del cañón.',
          events,
          terminalOutput: result.output,
          rawError: result.error,
        };
      }

      const asteroids = cfg.asteroids || [];
      const destroyedAsteroids = new Set<string>();

      for (const ast of asteroids) {
        // Expected formula: distance * 2 + 10
        const expectedPower = ast.distance * 2 + 10;
        const matchingShot = shots.find((s) => s.distance === ast.distance && Math.abs(s.power - expectedPower) <= 2);
        if (matchingShot) {
          destroyedAsteroids.add(ast.id);
          pushEvent('asteroid_destroyed', `¡${ast.name} a ${ast.distance}m derribada con impacto directo!`, {
            id: ast.id,
          });
        }
      }

      if (destroyedAsteroids.size < asteroids.length) {
        return {
          success: false,
          score: 1,
          message: `Derribaste ${destroyedAsteroids.size} de ${asteroids.length} objetivos. Comprueba la fórmula de potencia: potencia = distancia * 2 + 10.`,
          events,
          terminalOutput: result.output,
        };
      }

      return {
        success: true,
        score: 3,
        message: '¡Excelente calibración! Todas las gárgolas enemigas han sido neutralizadas con la balista.',
        events,
        terminalOutput: result.output,
      };
    }

    // -------------------------------------------------------------
    // GAME 3: EL ESCÁNER DE SEGURIDAD / GATEKEEPER
    // -------------------------------------------------------------
    if (level.gameType === 'gatekeeper') {
      const visitors = (cfg.visitors || []).map((v) => ({
        id: v.id,
        nombre: v.name,
        name: v.name,
        rol: v.role,
        role: v.role,
        es_aliado: v.isAlly,
        isAlly: v.isAlly,
        nivel: v.clearanceLevel,
        clearanceLevel: v.clearanceLevel,
        tiene_virus: v.hasVirus,
        hasVirus: v.hasVirus,
        contrabando: v.hasContraband,
        hasContraband: v.hasContraband,
      }));

      const verdicts: Record<string, 'allow' | 'block' | 'alarm'> = {};

      const compuerta = {
        abrir: (v: any) => {
          if (!v || !v.id) return;
          verdicts[v.id] = 'allow';
          pushEvent('gate_open', `Compuerta abierta para ${v.nombre || v.name}`, { id: v.id, action: 'allow' });
        },
        bloquear: (v: any) => {
          if (!v || !v.id) return;
          verdicts[v.id] = 'block';
          pushEvent('gate_block', `Acceso denegado a ${v.nombre || v.name}`, { id: v.id, action: 'block' });
        },
      };

      const alarma = {
        activar: (v: any) => {
          if (!v || !v.id) return;
          verdicts[v.id] = 'alarm';
          pushEvent('alarm_trigger', `¡ALARMA ROJA activada por ${v.nombre || v.name}!`, { id: v.id, action: 'alarm' });
        },
      };

      const result = runPythonCode(userCode, {
        visitantes: visitors,
        compuerta,
        alarma,
      });

      if (!result.success) {
        return {
          success: false,
          score: 0,
          message: result.error || 'Error al ejecutar el filtro de seguridad.',
          events,
          terminalOutput: result.output,
          rawError: result.error,
        };
      }

      const originalVisitors = cfg.visitors || [];
      let correctDecisions = 0;
      const mistakes: string[] = [];

      for (const orig of originalVisitors) {
        const actionTaken = verdicts[orig.id];
        if (actionTaken === orig.expectedAction) {
          correctDecisions++;
        } else {
          mistakes.push(
            `A "${orig.name}" le diste la acción "${actionTaken || 'ninguna'}", pero se esperaba "${orig.expectedAction}".`
          );
        }
      }

      if (correctDecisions < originalVisitors.length) {
        return {
          success: false,
          score: 1,
          message: `Fallo en el protocolo de seguridad (${correctDecisions}/${originalVisitors.length}): ${mistakes[0]}`,
          events,
          terminalOutput: result.output,
        };
      }

      return {
        success: true,
        score: 3,
        message: '¡Protocolo impecable! La fortaleza digital permanece protegida y operativa.',
        events,
        terminalOutput: result.output,
      };
    }

    // -------------------------------------------------------------
    // GAME 4: EL MINERO AUTOMATIZADO
    // -------------------------------------------------------------
    if (level.gameType === 'miner') {
      let battery = cfg.initialBattery ?? 100;
      let depth = 0;
      let minedCrystals = 0;
      const veins = cfg.veins || [];
      let overheat = false;

      const minero = {
        get mana() {
          return battery;
        },
        get bateria() {
          return battery;
        },
        get vagoneta_llena() {
          return minedCrystals >= (cfg.targetCrystals || 4);
        },
        picar: () => {
          if (battery <= 0) return;
          battery = Math.max(0, battery - 10);
          const currentVein = veins.find((v) => v.depth === depth);
          const crystalsFound = currentVein ? currentVein.crystals : 1;
          minedCrystals += crystalsFound;
          pushEvent('miner_dig', `Bloque picado en profundidad ${depth}. +${crystalsFound} gemas (Maná antorcha: ${battery}%)`, {
            depth,
            crystals: minedCrystals,
            battery,
            mana: battery,
          });
        },
        avanzar: () => {
          if (battery <= 0) return;
          depth += 1;
          battery = Math.max(0, battery - 5);
          pushEvent('miner_advance', `Minero avanzó al metro ${depth} (Maná antorcha: ${battery}%)`, {
            depth,
            battery,
            mana: battery,
          });
        },
      };

      const result = runPythonCode(userCode, { minero, automata: minero, pico: minero });
      if (!result.success) {
        return {
          success: false,
          score: 0,
          message: result.error || 'Error al ejecutar el autómata minero.',
          events,
          terminalOutput: result.output,
          rawError: result.error,
        };
      }

      const target = cfg.targetCrystals || 4;
      if (minedCrystals < target) {
        return {
          success: false,
          score: 1,
          message: `Has extraído ${minedCrystals} de los ${target} cristales solicitados. Revisa el rango o la condición del bucle.`,
          events,
          terminalOutput: result.output,
          finalState: { minedCrystals, battery, depth },
        };
      }

      return {
        success: true,
        score: 3,
        message: `¡Vagoneta llena! Extraídos ${minedCrystals} cristales con éxito antes de agotar la energía.`,
        events,
        terminalOutput: result.output,
        finalState: { minedCrystals, battery, depth },
      };
    }

    // -------------------------------------------------------------
    // GAME 5: LA MOCHILA RPG / INVENTARIO
    // -------------------------------------------------------------
    if (level.gameType === 'inventory') {
      let mochila: string[] = [...(cfg.initialInventory || [])];
      let chestOpened = false;

      const cofre = {
        abrir: () => {
          chestOpened = true;
          pushEvent('chest_open', '¡Cofre del tesoro abierto! ¡Luz dorada y botín legendario!', { opened: true });
        },
      };

      const result = runPythonCode(userCode, { mochila, cofre });
      if (!result.success) {
        return {
          success: false,
          score: 0,
          message: result.error || 'Error al procesar el inventario.',
          events,
          terminalOutput: result.output,
          rawError: result.error,
        };
      }

      // Read final state of mochila from scope if reassigned or created in Python
      const candidateMochila = (result.scope?.mochila as unknown) || (result.scope?.inventario as unknown);
      if (Array.isArray(candidateMochila)) {
        mochila = candidateMochila as string[];
      }

      pushEvent('inventory_sync', `Mochila actualizada (${mochila.length} objetos): [${mochila.join(', ')}]`, { mochila });

      // Check disallowed items (e.g. poison removed)
      if (cfg.disallowedItems) {
        for (const item of cfg.disallowedItems) {
          if (mochila.includes(item)) {
            return {
              success: false,
              score: 1,
              message: `El objeto prohibido "${item}" todavía está en la mochila. Usa mochila.remove("${item}") para eliminarlo.`,
              events,
              terminalOutput: result.output,
              finalState: { mochila, chestOpened },
            };
          }
        }
      }

      // Check required items
      if (cfg.targetInventory) {
        for (const req of cfg.targetInventory) {
          const hasReq = mochila.includes(req) ||
            (req === 'anillo de teletransporte' && (mochila.includes('anillo_de_teletransporte') || mochila.includes('anillo de teletransporte'))) ||
            (req === 'anillo_de_teletransporte' && (mochila.includes('anillo de teletransporte') || mochila.includes('anillo_de_teletransporte')));

          if (!hasReq) {
            return {
              success: false,
              score: 1,
              message: `Te falta el objeto "${req}" en tu mochila. Usa mochila.append("${req}").`,
              events,
              terminalOutput: result.output,
              finalState: { mochila, chestOpened },
            };
          }
        }
      }

      // Check chest opening if chests exist
      if (cfg.availableChests && cfg.availableChests.length > 0 && !chestOpened) {
        return {
          success: false,
          score: 1,
          message: '¡Tienes la llave pero no abriste el cofre! Llama a cofre.abrir() cuando tengas la llave en la mochila.',
          events,
          terminalOutput: result.output,
          finalState: { mochila, chestOpened },
        };
      }

      pushEvent('inventory_success', '¡Inventario perfectamente gestionado!', { mochila });
      return {
        success: true,
        score: 3,
        message: '¡Equipamiento listo y tesoro desbloqueado con éxito!',
        events,
        terminalOutput: result.output,
        finalState: { mochila, chestOpened },
      };
    }

    // -------------------------------------------------------------
    // GAME 6: LA ARENA CYBER-BOSS
    // -------------------------------------------------------------
    if (level.gameType === 'boss_battle') {
      const bossMaxHp = cfg.bossHp || 100;
      let bossHp = bossMaxHp;
      let playerHp = cfg.playerHp || 100;
      const rounds = cfg.roundsCount || 3;

      // Check user code defining functions
      const result = runPythonCode(userCode, {});
      if (!result.success) {
        return {
          success: false,
          score: 0,
          message: result.error || 'Error al ejecutar la función de combate.',
          events,
          terminalOutput: result.output,
          rawError: result.error,
        };
      }

      // Simulate combat rounds by invoking the user's function directly from the evaluated scope
      const fnGolpeMaestro = typeof result.scope?.golpe_maestro === 'function' ? (result.scope.golpe_maestro as (...args: unknown[]) => unknown) : null;
      const fnCalcularAtaque = typeof result.scope?.calcular_ataque === 'function' ? (result.scope.calcular_ataque as (...args: unknown[]) => unknown) : null;

      if (!fnGolpeMaestro && !fnCalcularAtaque) {
        return {
          success: false,
          score: 0,
          message: 'No se ha encontrado la función requerida. Asegúrate de definir "def calcular_ataque(fuerza, escudo_boss):" o "def golpe_maestro(fuerza, es_critico, armadura):" y devolver el daño con return.',
          events,
          terminalOutput: result.output,
        };
      }

      for (let r = 1; r <= rounds; r++) {
        const force = 30 + r * 5;
        const isCrit = r % 2 === 0;
        const shield = cfg.bossShield || 10;

        let damage = 0;
        try {
          if (fnGolpeMaestro) {
            damage = Number(fnGolpeMaestro(force, isCrit, shield)) || 0;
          } else if (fnCalcularAtaque) {
            damage = Number(fnCalcularAtaque(force, shield)) || 0;
          }
        } catch (err: unknown) {
          const errStr = err instanceof Error ? err.message : String(err);
          return {
            success: false,
            score: 0,
            message: `Error al ejecutar la función de ataque en la ronda ${r}: ${errStr}`,
            events,
            terminalOutput: result.output,
          };
        }

        bossHp = Math.max(0, bossHp - damage);

        pushEvent(
          'combat_round',
          `Ronda ${r}: Héroe atacó con fuerza ${force} ${isCrit ? '(¡CRÍTICO!)' : ''} e infligió ${damage} de daño. (Boss HP: ${bossHp}/${bossMaxHp})`,
          { round: r, damage, isCrit, bossHp }
        );

        if (bossHp <= 0) break;
      }

      if (bossHp > 0) {
        return {
          success: false,
          score: 1,
          message: `El Boss sobrevivió con ${bossHp} HP. Revisa los cálculos de daño, multiplicadores críticos o el valor devuelto con return.`,
          events,
          terminalOutput: result.output,
          finalState: { bossHp, playerHp },
        };
      }

      pushEvent('boss_defeated', '¡VICTORIA! ¡El Cyber-Boss ha sido derrotado!');
      return {
        success: true,
        score: 3,
        message: '¡Victoria Épica! Has coordinado tus funciones de combate a la perfección y derrotado al Boss.',
        events,
        terminalOutput: result.output,
        finalState: { bossHp: 0, playerHp },
      };
    }

    // -------------------------------------------------------------
    // GAME 7: BATALLA TÁCTICA DE ROL (Reto 1)
    // Acciones: atacar, defenderse, cambiar_arma, huir
    // -------------------------------------------------------------
    if (level.gameType === 'battle') {
      const enemyName = cfg.enemyName || 'Trasgo Guardián';
      const enemyMaxHp = cfg.enemyHp || 30;
      let enemyHp = enemyMaxHp;
      let playerHp = cfg.playerHp || 100;
      let currentWeapon = 'Daga Oxidada';
      let isDefending = false;
      let hasFled = false;
      let actionsCount = 0;

      const personaje = {
        atacar: () => {
          actionsCount++;
          let baseDmg = 12;
          const wLower = currentWeapon.toLowerCase();
          if (wLower.includes('espada') || wLower.includes('mandoble') || wLower.includes('acero')) baseDmg = 20;
          else if (wLower.includes('hacha') || wLower.includes('martillo')) baseDmg = 22;
          else if (wLower.includes('arco') || wLower.includes('fuego')) baseDmg = 25;
          else if (wLower.includes('hechizo') || wLower.includes('rayo')) baseDmg = 28;

          const d20 = Math.floor(Math.random() * 5) + 16; // Heroic roll 16-20
          const damage = baseDmg;
          enemyHp = Math.max(0, enemyHp - damage);

          pushEvent(
            'battle_attack',
            `⚔️ ¡Asestas un golpe al ${enemyName} con tu ${currentWeapon}! (Tirada d20: ${d20}) - Infliges ${damage} PV. (${enemyHp}/${enemyMaxHp} PV restantes del enemigo)`,
            { enemyHp, playerHp, damage, weapon: currentWeapon, enemyName }
          );

          // If enemy survives, it launches a counter-attack
          if (enemyHp > 0) {
            if (isDefending) {
              pushEvent(
                'battle_defend_success',
                `🛡️ ¡El ${enemyName} contrataca con furia, pero tu escudo bloquea el impacto por completo! (0 daño recibido)`,
                { enemyHp, playerHp, enemyName }
              );
              isDefending = false; // Consumed defense
            } else {
              const enemyDmg = 10;
              playerHp = Math.max(0, playerHp - enemyDmg);
              pushEvent(
                'battle_enemy_attack',
                `💥 El ${enemyName} aprovecha la guardia abierta y te golpea con su garrote (-${enemyDmg} PV). (Salud del Héroe: ${playerHp}/100 PV)`,
                { enemyHp, playerHp, damage: enemyDmg, enemyName }
              );
            }
          }
        },

        defenderse: () => {
          actionsCount++;
          isDefending = true;
          pushEvent(
            'battle_defend',
            `🛡️ Adoptas una postura defensiva y levantas el escudo. El próximo asalto del enemigo quedará completamente bloqueado.`,
            { enemyHp, playerHp, enemyName }
          );
        },

        cambiar_arma: (nuevaArma?: string) => {
          actionsCount++;
          currentWeapon = nuevaArma ? String(nuevaArma) : 'Espada de Acero';
          pushEvent(
            'battle_change_weapon',
            `🗡️ Enfunda el arma anterior y empuñas: ¡${currentWeapon}! Tu filo rúnico está listo para un ataque contundente.`,
            { enemyHp, playerHp, weapon: currentWeapon, enemyName }
          );
        },

        huir: () => {
          actionsCount++;
          hasFled = true;
          pushEvent(
            'battle_flee',
            `💨 ¡Tirada de Agilidad superada! Arrojas una bomba de humo y realizas una retirada táctica veloz hacia un pasadizo seguro, evitando el combate.`,
            { enemyHp, playerHp, enemyName }
          );
        },
      };

      const scope = {
        personaje,
        heroe: personaje,
        jugador: personaje,
        aventurero: personaje,
        atacar: () => personaje.atacar(),
        defenderse: () => personaje.defenderse(),
        cambiar_arma: (w?: string) => personaje.cambiar_arma(w),
        huir: () => personaje.huir(),
      };

      const result = runPythonCode(userCode, scope);
      if (!result.success) {
        return {
          success: false,
          score: 0,
          message: result.error || 'Error en la sintaxis de combate en Python.',
          events,
          terminalOutput: result.output,
          rawError: result.error,
        };
      }

      if (actionsCount === 0) {
        return {
          success: false,
          score: 0,
          message: 'No has invocado ninguna acción. Prueba con personaje.atacar(), personaje.defenderse(), personaje.cambiar_arma("espada") o personaje.huir().',
          events,
          terminalOutput: result.output,
        };
      }

      if (hasFled) {
        pushEvent('battle_victory', `🏆 ¡Retirada estratégica completada! Has preservado la integridad de la comitiva.`);
        return {
          success: true,
          score: 3,
          message: '¡Excelente resolución táctica! Has sabido utilizar la acción de huir() para eludir el peligro.',
          events,
          terminalOutput: result.output,
          finalState: { enemyHp, playerHp, currentWeapon, hasFled },
        };
      }

      if (enemyHp <= 0) {
        pushEvent('battle_victory', `🏆 ¡Victoria en la batalla! El ${enemyName} ha sido derrotado.`);
        return {
          success: true,
          score: 3,
          message: '¡Victoria épica! Has coordinado tus maniobras de combate con Python y superado tu primera batalla.',
          events,
          terminalOutput: result.output,
          finalState: { enemyHp: 0, playerHp, currentWeapon, hasFled },
        };
      }

      return {
        success: false,
        score: 1,
        message: `El ${enemyName} aún sobrevive con ${enemyHp} PV. Prueba a equipar un arma más potente con personaje.cambiar_arma("espada de acero") y atacar de nuevo, o utiliza personaje.huir().`,
        events,
        terminalOutput: result.output,
        finalState: { enemyHp, playerHp, currentWeapon, hasFled },
      };
    }

    return {
      success: false,
      score: 0,
      message: 'Tipo de minijuego no reconocido.',
      events: [],
      terminalOutput: '',
    };
  } catch (e: any) {
    return {
      success: false,
      score: 0,
      message: `Error imprevisto en la simulación: ${e.message}`,
      events,
      terminalOutput: '',
    };
  }
}
