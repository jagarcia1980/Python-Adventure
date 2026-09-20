import React, { useState, useEffect, useRef } from 'react';
import { Level } from '../../types';
import { SimulationOutcome, GameSimulationEvent } from '../../utils/gameSimulator';
import { 
  Play, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  Sparkles, 
  RotateCcw, 
  Dices, 
  Scroll, 
  Shield, 
  FastForward, 
  Terminal,
  Compass,
  Sword,
  Gem,
  Flame,
  Skull,
  Target,
  Lock,
  Unlock,
  Key,
  Backpack,
  Footprints,
  Zap,
  AlertTriangle,
  ArrowRight,
  Trophy,
  Crosshair
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { RPG_IMAGES } from '../../assets/rpgImages';

interface MiniGameArenaProps {
  level: Level;
  simulationOutcome: SimulationOutcome | null;
  isPlaying: boolean;
  onRunSimulation: () => void;
  onSimulationFinished?: () => void;
  onD20BonusChange?: (bonusXp: number, rollValue: number) => void;
}

export const MiniGameArena: React.FC<MiniGameArenaProps> = ({
  level,
  simulationOutcome,
  isPlaying,
  onRunSimulation,
  onSimulationFinished,
  onD20BonusChange,
}) => {
  const cfg = level.gameConfig;
  const events = simulationOutcome?.events || [];

  // Parse target Difficulty Class (CD) from RPG context
  const matchCd = level.rpgContext?.diceCheck?.match(/CD\s*([0-9]+)/i);
  const targetCd = matchCd ? parseInt(matchCd[1], 10) : 12;

  // Narrative playback state
  const [currentEventIndex, setCurrentEventIndex] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<'normal' | 'fast' | 'instant'>('normal');
  const [isNarrating, setIsNarrating] = useState<boolean>(false);
  const [manualD20Roll, setManualD20Roll] = useState<{
    value: number;
    isRolling: boolean;
    resultType?: 'critical' | 'success' | 'fail' | 'fumble';
    bonusXp: number;
    message: string;
  } | null>(null);
  const chronicleEndRef = useRef<HTMLDivElement>(null);

  // When simulationOutcome changes, start narrating events step by step
  useEffect(() => {
    if (!simulationOutcome) {
      setCurrentEventIndex(0);
      setIsNarrating(false);
      return;
    }

    if (playbackSpeed === 'instant' || events.length === 0) {
      setCurrentEventIndex(events.length);
      setIsNarrating(false);
      if (onSimulationFinished) onSimulationFinished();
      return;
    }

    setIsNarrating(true);
    setCurrentEventIndex(0);

    const delay = playbackSpeed === 'fast' ? 250 : 650;
    let idx = 0;

    const interval = setInterval(() => {
      idx += 1;
      setCurrentEventIndex(idx);
      sound.click();

      if (idx >= events.length) {
        clearInterval(interval);
        setIsNarrating(false);
        if (onSimulationFinished) onSimulationFinished();
      }
    }, delay);

    return () => clearInterval(interval);
  }, [simulationOutcome, playbackSpeed]);

  // Scroll chronicle into view as events unfold
  useEffect(() => {
    if (chronicleEndRef.current) {
      chronicleEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentEventIndex]);

  // Manual D20 Roll widget against Mission Difficulty Class (CD)
  const handleRollManualD20 = () => {
    sound.click();
    setManualD20Roll({
      value: 0,
      isRolling: true,
      bonusXp: 0,
      message: 'El dado poliédrico rueda sobre la mesa del Máster...',
    });

    setTimeout(() => {
      const val = Math.floor(Math.random() * 20) + 1;
      let resultType: 'critical' | 'success' | 'fail' | 'fumble' = 'fail';
      let bonusXp = 0;
      let message = '';

      const missionBaseXp = level.xpReward || 60;

      if (val === 20) {
        resultType = 'critical';
        // Supreme booster: Double XP (+100% bonus, minimum 40 XP)
        bonusXp = Math.max(40, missionBaseXp);
        message = `¡¡20 NATURAL!! ¡Éxito Crítico Legendario! El Máster se pone en pie: "¡Los dados bendicen tu ingenio!". Has activado el Potenciador Temporal Supremo: ¡DOBLE XP (+${bonusXp} XP adicionales al superar la misión)!`;
        sound.levelComplete();
      } else if (val >= targetCd) {
        resultType = 'success';
        // Temporary XP booster: +50% XP (minimum 25 XP)
        bonusXp = Math.max(25, Math.round(missionBaseXp * 0.5));
        message = `¡Tirada superada (${val} vs CD ${targetCd})! Has activado el Potenciador Temporal de XP: el Máster te otorga un +50% de experiencia extra (+${bonusXp} XP adicionales al resolver el desafío).`;
        sound.correct();
      } else if (val === 1) {
        resultType = 'fumble';
        bonusXp = 0;
        message = `Pifia (1 natural). Tu aventurero tropieza cómicamente en la mazmorra, pero la magia de tu código Python aún puede salvar la partida.`;
        sound.click();
      } else {
        resultType = 'fail';
        bonusXp = 0;
        message = `Tirada de ${val} vs CD ${targetCd}. No activas el potenciador esta vez, ¡pero tu código determinará la victoria final! Puedes volver a lanzar el dado si deseas tentar la suerte.`;
        sound.click();
      }

      setManualD20Roll({
        value: val,
        isRolling: false,
        resultType,
        bonusXp,
        message,
      });

      if (onD20BonusChange) {
        onD20BonusChange(bonusXp, val);
      }
    }, 450);
  };

  // Helper to render graphical tactical representation based on current level and events up to current index
  const renderGraphicalTacticalDisplay = () => {
    const activeEvents = events.slice(0, currentEventIndex);

    switch (level.gameType) {
      case 'battle': {
        const enemyName = cfg.enemyName || 'Trasgo Guardián';
        const enemyMaxHp = cfg.enemyHp || 30;
        let enemyHp = enemyMaxHp;
        let playerHp = 100;
        let currentWeapon = 'Daga oxidada';
        let lastAction = 'En guardia';
        let actionEffect = '';

        for (const ev of activeEvents) {
          if (ev.payload?.enemyHp !== undefined) enemyHp = ev.payload.enemyHp;
          if (ev.payload?.playerHp !== undefined) playerHp = ev.payload.playerHp;
          if (ev.payload?.weapon) currentWeapon = ev.payload.weapon;
          if (ev.type === 'battle_attack') {
            lastAction = `Ataque con ${currentWeapon}`;
            actionEffect = '⚔️ ¡Ataque impactado!';
          }
          if (ev.type === 'battle_defend') {
            lastAction = 'Escudo levantado';
            actionEffect = '🛡️ Postura defensiva';
          }
          if (ev.type === 'battle_defend_success') {
            lastAction = '¡Ataque rival bloqueado!';
            actionEffect = '✨ ¡0 daño recibido!';
          }
          if (ev.type === 'battle_change_weapon') {
            lastAction = `Arma equipada: ${currentWeapon}`;
            actionEffect = `🗡️ Ahora empuñas ${currentWeapon}`;
          }
          if (ev.type === 'battle_flee') {
            lastAction = '¡Retirada táctica!';
            actionEffect = '💨 Has escapado del combate';
          }
          if (ev.type === 'battle_victory') {
            lastAction = '¡Victoria!';
            actionEffect = '🏆 ¡Enemigo derrotado!';
          }
        }

        const enemyHpPct = Math.max(0, Math.min(100, Math.round((enemyHp / enemyMaxHp) * 100)));
        const playerHpPct = Math.max(0, Math.min(100, Math.round((playerHp / 100) * 100)));

        return (
          <div className="space-y-4">
            {/* Arena Header Status */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#856139]/40 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span className="text-xs font-rpg-title font-bold text-amber-300 tracking-wider">
                  ARENA DE COMBATE TÁCTICO
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-600/50 text-amber-200 text-xs font-serif font-bold">
                {lastAction}
              </span>
            </div>

            {/* Visual Combat Stage (Two Combatants + Center Clash) */}
            <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center bg-gradient-to-b from-[#1c130c] to-[#120b06] p-4 rounded-2xl border border-[#785331]/50 shadow-inner">
              
              {/* Left Side: Hero Card */}
              <div className="md:col-span-5 flex items-center gap-3.5 bg-[#251810]/80 p-3.5 rounded-xl border border-amber-900/40 shadow-md">
                <div className="relative shrink-0">
                  <img
                    src={RPG_IMAGES.heroWarrior}
                    alt="Héroe Aventurero"
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-amber-500 shadow-md shadow-amber-950/50"
                  />
                  <div className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded bg-stone-950 border border-amber-500/70 text-[10px] font-mono font-bold text-amber-300">
                    Nvl. 1
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs sm:text-sm font-bold font-serif text-amber-100 truncate">
                      Héroe Aventurero
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">
                      {playerHp}/100 PV
                    </span>
                  </div>

                  {/* Player Health Bar */}
                  <div className="w-full h-3 bg-stone-950 rounded-full overflow-hidden border border-[#523c27]">
                    <div
                      className={`h-full transition-all duration-300 ${
                        playerHpPct > 50
                          ? 'bg-gradient-to-r from-emerald-600 to-green-400'
                          : playerHpPct > 20
                          ? 'bg-gradient-to-r from-amber-600 to-yellow-400'
                          : 'bg-gradient-to-r from-rose-700 to-red-500'
                      }`}
                      style={{ width: `${playerHpPct}%` }}
                    />
                  </div>

                  {/* Equipped Weapon Pill */}
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#180e08] border border-amber-600/30 text-[11px] text-amber-300 font-serif">
                    <Sword size={11} className="text-amber-400" />
                    <span className="capitalize truncate max-w-[140px]">{currentWeapon}</span>
                  </div>
                </div>
              </div>

              {/* Center Clash Area */}
              <div className="md:col-span-1 flex flex-col items-center justify-center text-center py-1">
                <div className="w-9 h-9 rounded-full bg-[#3d2412] border-2 border-[#b45309] flex items-center justify-center text-amber-400 font-rpg-title font-extrabold text-xs shadow-lg shadow-amber-950/60">
                  VS
                </div>
                {actionEffect && (
                  <span className="mt-1 text-[10px] font-mono text-amber-300 font-bold px-1.5 py-0.5 rounded bg-black/40 border border-amber-600/30 whitespace-nowrap">
                    {actionEffect}
                  </span>
                )}
              </div>

              {/* Right Side: Enemy Card */}
              <div className="md:col-span-5 flex items-center gap-3.5 bg-[#251810]/80 p-3.5 rounded-xl border border-rose-950/60 shadow-md">
                <div className="flex-1 min-w-0 space-y-1.5 text-right">
                  <div className="flex items-center justify-between flex-row-reverse gap-1">
                    <span className="text-xs sm:text-sm font-bold font-serif text-rose-200 truncate">
                      {enemyName}
                    </span>
                    <span className="text-[11px] font-mono text-rose-400 font-bold">
                      {enemyHp}/{enemyMaxHp} PV
                    </span>
                  </div>

                  {/* Enemy Health Bar */}
                  <div className="w-full h-3 bg-stone-950 rounded-full overflow-hidden border border-[#523c27]">
                    <div
                      className="h-full bg-gradient-to-r from-rose-700 via-red-500 to-rose-400 transition-all duration-300 ml-auto"
                      style={{ width: `${enemyHpPct}%` }}
                    />
                  </div>

                  {/* Enemy Status Pill */}
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#180e08] border border-rose-900/40 text-[11px] text-rose-300 font-serif">
                    {enemyHp <= 0 ? (
                      <>
                        <Skull size={11} className="text-rose-400" />
                        <span>¡Derrotado!</span>
                      </>
                    ) : (
                      <>
                        <Shield size={11} className="text-stone-400" />
                        <span>Maza de asalto</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="relative shrink-0">
                  <img
                    src={RPG_IMAGES.goblinGuard}
                    alt={enemyName}
                    referrerPolicy="no-referrer"
                    className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 transition-all ${
                      enemyHp <= 0 
                        ? 'border-stone-700 grayscale opacity-60' 
                        : 'border-rose-600 shadow-md shadow-rose-950/50'
                    }`}
                  />
                  {enemyHp <= 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl">
                      <Skull size={24} className="text-rose-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tactical Commands Cheat Sheet */}
            <div className="bg-[#191009] p-3 rounded-xl border border-[#785331]/40 text-xs">
              <span className="text-amber-300 font-bold font-serif block mb-2">
                📜 Acciones Tácticas Disponibles en Python:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="bg-[#24170d] p-2 rounded-lg border border-amber-950/60 flex items-center gap-2">
                  <span className="text-amber-400 font-bold">⚔️</span>
                  <div>
                    <code className="text-amber-200 font-mono font-bold">personaje.atacar()</code>
                    <span className="text-stone-400 block text-[10px]">Asesta un golpe con el arma equipada</span>
                  </div>
                </div>
                <div className="bg-[#24170d] p-2 rounded-lg border border-amber-950/60 flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">🛡️</span>
                  <div>
                    <code className="text-amber-200 font-mono font-bold">personaje.defenderse()</code>
                    <span className="text-stone-400 block text-[10px]">Levanta el escudo para anular el daño rival</span>
                  </div>
                </div>
                <div className="bg-[#24170d] p-2 rounded-lg border border-amber-950/60 flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">🗡️</span>
                  <div>
                    <code className="text-amber-200 font-mono font-bold">personaje.cambiar_arma(&quot;espada de acero&quot;)</code>
                    <span className="text-stone-400 block text-[10px]">Equipa un arma con mayor daño</span>
                  </div>
                </div>
                <div className="bg-[#24170d] p-2 rounded-lg border border-amber-950/60 flex items-center gap-2">
                  <span className="text-rose-400 font-bold">💨</span>
                  <div>
                    <code className="text-amber-200 font-mono font-bold">personaje.huir()</code>
                    <span className="text-stone-400 block text-[10px]">Ejecuta una retirada estratégica</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'rover': {
        // Dungeon exploration graphical grid
        const gridW = cfg.gridWidth || 5;
        const gridH = cfg.gridHeight || 5;

        let posX = cfg.roverStart?.x ?? 0;
        let posY = cfg.roverStart?.y ?? 2;
        let dir = cfg.roverStart?.dir ?? 'E';
        let collectedCount = 0;
        let isCrashed = false;

        for (const ev of activeEvents) {
          if (ev.type === 'rover_move' && ev.payload) {
            posX = ev.payload.x;
            posY = ev.payload.y;
            dir = ev.payload.dir;
          } else if (ev.type === 'rover_turn' && ev.payload) {
            dir = ev.payload.dir;
          } else if (ev.type === 'rover_collect') {
            collectedCount += 1;
          } else if (ev.type === 'rover_crash') {
            isCrashed = true;
          }
        }

        const base = cfg.baseStation || { x: gridW - 1, y: 2 };
        const crystals = cfg.crystals || [];
        const obstacles = cfg.obstacles || [];

        const dirLabel = dir === 'N' ? 'Norte (▲)' : dir === 'E' ? 'Este (▶)' : dir === 'S' ? 'Sur (▼)' : 'Oeste (◀)';

        return (
          <div className="space-y-3">
            {/* Live Tactical HUD Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#856139]/40 pb-2">
              <div className="flex items-center gap-2">
                <Compass size={14} className="text-amber-400" />
                <span className="text-xs font-rpg-title font-bold text-amber-300 tracking-wider">
                  MAPA GRÁFICO DE LAS MAZMORRAS ({gridW}x{gridH})
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 flex items-center gap-1">
                  <Gem size={12} className="text-cyan-400" />
                  <span>Gemas: {collectedCount}/{crystals.length}</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-600/50 text-amber-200">
                  Rumbo: {dirLabel}
                </span>
              </div>
            </div>

            {/* 2D Graphical Dungeon Board */}
            <div className="bg-[#140c06] p-3 sm:p-4 rounded-2xl border border-[#785331]/60 shadow-2xl">
              <div 
                className="grid gap-2 max-w-md mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${gridW}, minmax(0, 1fr))`
                }}
              >
                {Array.from({ length: gridH }).map((_, y) => (
                  <React.Fragment key={y}>
                    {Array.from({ length: gridW }).map((__, x) => {
                      const isHero = x === posX && y === posY;
                      const isExit = x === base.x && y === base.y;
                      const isCrystal = crystals.some((c) => c.x === x && c.y === y);
                      const isObstacle = obstacles.some((o) => o.x === x && o.y === y);

                      return (
                        <div
                          key={`${x}-${y}`}
                          className={`relative aspect-square rounded-xl border transition-all flex items-center justify-center p-1 ${
                            isHero
                              ? 'bg-[#312013] border-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.6)] ring-1 ring-amber-400/80 z-20'
                              : isExit
                              ? 'bg-gradient-to-br from-amber-950/80 to-yellow-950/50 border-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                              : isCrystal
                              ? 'bg-[#1a2328] border-cyan-700/60 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                              : isObstacle
                              ? 'bg-rose-950/40 border-rose-800/60'
                              : 'bg-[#1f150d] border-[#442c1b]/80 hover:border-[#6b472c]/60'
                          }`}
                        >
                          {/* Coordinates watermark */}
                          <span className="absolute top-1 left-1 text-[8px] font-mono text-stone-600 select-none pointer-events-none">
                            {x},{y}
                          </span>

                          {/* Hero Token */}
                          {isHero ? (
                            <div className="relative flex flex-col items-center justify-center w-full h-full">
                              <img
                                src={RPG_IMAGES.heroWarrior}
                                alt="Héroe"
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-amber-300 shadow-md"
                              />
                              {/* Direction Indicator Arrow */}
                              <div className="absolute -bottom-1 px-1 py-0.2 rounded bg-amber-500 text-stone-950 font-bold text-[9px] shadow leading-tight">
                                {dir === 'N' ? '▲' : dir === 'E' ? '▶' : dir === 'S' ? '▼' : '◀'}
                              </div>
                              {isCrashed && (
                                <div className="absolute inset-0 bg-red-600/80 rounded-xl flex items-center justify-center text-white text-xs font-bold animate-ping">
                                  💥
                                </div>
                              )}
                            </div>
                          ) : isExit ? (
                            /* Exit Runic Portal Token */
                            <div className="flex flex-col items-center justify-center text-center">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-amber-500 to-yellow-300 text-stone-950 flex items-center justify-center shadow-md animate-pulse">
                                <Sparkles size={16} className="fill-current" />
                              </div>
                              <span className="text-[9px] font-serif font-extrabold text-amber-200 mt-0.5 tracking-tighter">
                                SALIDA
                              </span>
                            </div>
                          ) : isCrystal ? (
                            /* Mana Crystal Gem */
                            <div className="flex flex-col items-center justify-center animate-bounce">
                              <Gem size={22} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                              <span className="text-[8px] font-bold text-cyan-200">Maná</span>
                            </div>
                          ) : isObstacle ? (
                            /* Spikes / Pit Hazard */
                            <div className="flex flex-col items-center justify-center text-rose-400/90">
                              <Skull size={18} />
                              <span className="text-[8px] font-mono font-bold text-rose-300">Foso</span>
                            </div>
                          ) : (
                            /* Empty stone flagstone */
                            <div className="w-1.5 h-1.5 rounded-full bg-[#573922]/50" />
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Visual Legend */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-serif text-stone-300 pt-1">
              <div className="flex items-center gap-1.5 bg-[#21150c] px-2.5 py-1 rounded-lg border border-[#785331]/30">
                <div className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-amber-200" />
                <span>Héroe ({posX}, {posY})</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#21150c] px-2.5 py-1 rounded-lg border border-[#785331]/30">
                <Gem size={13} className="text-cyan-400" />
                <span>Gemas de Maná</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#21150c] px-2.5 py-1 rounded-lg border border-[#785331]/30">
                <Skull size={13} className="text-rose-400" />
                <span>Foso Peligroso</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#21150c] px-2.5 py-1 rounded-lg border border-[#785331]/30">
                <Sparkles size={13} className="text-amber-400" />
                <span>Portal de Salida ({base.x}, {base.y})</span>
              </div>
            </div>
          </div>
        );
      }

      case 'cannon': {
        // Balista & Siege Graphical Layout
        let totalFired = 0;
        let lastTarget = '';
        const destroyedSet = new Set<string>();

        for (const ev of activeEvents) {
          if (ev.type === 'cannon_fire') totalFired += 1;
          if (ev.type === 'asteroid_destroyed') {
            lastTarget = ev.message;
            if (ev.payload?.id) destroyedSet.add(ev.payload.id);
          }
        }

        const targets = cfg.asteroids || [
          { id: 'ast1', name: 'Gárgola Alfa', distance: 30 },
          { id: 'ast2', name: 'Gárgola Beta', distance: 60 },
        ];

        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#856139]/40 pb-2">
              <div className="flex items-center gap-2">
                <Crosshair size={14} className="text-amber-400" />
                <span className="text-xs font-rpg-title font-bold text-amber-300 tracking-wider">
                  TORRE DE BALISTAS - CÁLCULO DE DISPARO
                </span>
              </div>
              <span className="text-xs font-mono text-amber-200 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600/50">
                Disparos: {totalFired}
              </span>
            </div>

            <div className="bg-gradient-to-r from-[#21140b] via-[#1a1008] to-[#24130a] p-4 rounded-xl border border-[#785331]/50 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              {/* Ballista Fortress Side */}
              <div className="flex items-center gap-3 bg-[#2d1b10] p-3 rounded-xl border border-amber-900/40">
                <div className="w-12 h-12 rounded-xl bg-stone-900 border border-amber-500/60 flex items-center justify-center text-amber-400">
                  <Target size={26} />
                </div>
                <div>
                  <span className="text-xs font-bold font-serif text-amber-100 block">Balista de Muralla</span>
                  <span className="text-[10px] text-stone-400 font-mono">Calibración en marcha</span>
                </div>
              </div>

              {/* Trajectory Banner */}
              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-amber-400 font-mono font-bold mb-1">
                  potencia = distancia * 2 + 10
                </span>
                <div className="w-full flex items-center gap-1 text-amber-600/70">
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-amber-500 to-amber-300 border-dashed" />
                  <span className="text-xs">🏹</span>
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-amber-300 to-red-500" />
                </div>
                {lastTarget && (
                  <span className="text-[10px] font-bold text-emerald-400 mt-1">✓ {lastTarget}</span>
                )}
              </div>

              {/* Targets Side - DYNAMIC from level configuration */}
              <div className="space-y-1.5 bg-[#2d1b10] p-3 rounded-xl border border-rose-950/60">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold font-serif text-rose-300">
                    Objetivos Enemigos ({targets.length}):
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    {destroyedSet.size}/{targets.length} abatidos
                  </span>
                </div>
                <div className="space-y-1">
                  {targets.map((tgt) => {
                    const isDestroyed = destroyedSet.has(tgt.id);
                    return (
                      <div
                        key={tgt.id}
                        className={`flex items-center justify-between text-[11px] font-mono px-2.5 py-1 rounded transition-all ${
                          isDestroyed
                            ? 'bg-emerald-950/50 border border-emerald-800/60 text-emerald-200'
                            : 'bg-black/50 border border-rose-950/40 text-stone-200'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span>{isDestroyed ? '✓' : '🎯'}</span>
                          <span className={isDestroyed ? 'line-through text-emerald-400/80' : 'font-semibold'}>
                            {tgt.name}
                          </span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-300 font-bold">{tgt.distance}m</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-sans uppercase font-bold ${
                              isDestroyed ? 'bg-emerald-800 text-white' : 'bg-rose-900/60 text-rose-200'
                            }`}
                          >
                            {isDestroyed ? 'Abatida' : 'En Vuelo'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'gatekeeper': {
        let allowed = 0;
        let blocked = 0;
        for (const ev of activeEvents) {
          if (ev.type === 'gate_open') allowed += 1;
          if (ev.type === 'gate_block' || ev.type === 'alarm_trigger') blocked += 1;
        }

        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#856139]/40 pb-2">
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-amber-400" />
                <span className="text-xs font-rpg-title font-bold text-amber-300 tracking-wider">
                  EL GUARDIÁN DE LA PUERTA RÚNICA
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-emerald-400">Acceso: {allowed}</span>
                <span className="text-stone-500">|</span>
                <span className="text-rose-400">Bloqueados: {blocked}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center bg-[#191008] p-3 rounded-2xl border border-[#785331]/50">
              <div className="relative rounded-xl overflow-hidden border border-amber-900/60 shadow-lg">
                <img
                  src={RPG_IMAGES.runicGate}
                  alt="Puerta Rúnica"
                  referrerPolicy="no-referrer"
                  className="w-full h-36 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                  <span className="text-[11px] font-serif font-bold text-amber-200">
                    Portal Ancestral de Verificación
                  </span>
                </div>
              </div>

              <div className="space-y-2 bg-[#25170d] p-3 rounded-xl border border-amber-950/60 text-xs">
                <span className="text-amber-300 font-bold font-serif block">Protocolo de la Guardia:</span>
                <div className="space-y-1 text-[11px] text-stone-300">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <span>✓</span>
                    <span>Permitir: Aliados & Nivel &gt;= 2</span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-300">
                    <span>✗</span>
                    <span>Rechazar: Desconocidos o Veneno</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-400">
                    <span>⚠️</span>
                    <span>Alarma: Contrabando Oculto</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'miner': {
        let depth = 0;
        let gems = 0;
        let battery = 100;

        for (const ev of activeEvents) {
          if (ev.payload?.depth !== undefined) depth = ev.payload.depth;
          if (ev.payload?.crystals !== undefined) gems = ev.payload.crystals;
          if (ev.payload?.battery !== undefined) battery = ev.payload.battery;
        }

        const totalCrystalsNeeded = cfg.targetCrystals || 5;
        const isForLoopMission = level.id === 'w3_l1';

        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#856139]/40 pb-2">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-amber-400" />
                <span className="text-xs font-rpg-title font-bold text-amber-300 tracking-wider">
                  GALERÍA DE EXTRACCIÓN DE MITHRIL & GEMAS
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-cyan-300">Profundidad: {depth}m</span>
                <span className="text-xs font-mono text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600/40">
                  Cristales: {gems} / {totalCrystalsNeeded} 💎
                </span>
              </div>
            </div>

            {/* 5-Node Mining Tunnel Pathway */}
            <div className="bg-[#120b06] p-3 sm:p-4 rounded-2xl border border-[#785331]/60 space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
                <span>Entrada a la Mina (0m)</span>
                <span className="text-amber-400 font-bold">
                  {isForLoopMission ? 'Bucle for paso in range(5):' : 'Bucle while de Excavación:'}
                </span>
                <span>Fondo de la Veta ({totalCrystalsNeeded}m)</span>
              </div>

              {/* Tunnel Track */}
              <div className="grid grid-cols-5 gap-2 relative py-1">
                {Array.from({ length: totalCrystalsNeeded }).map((_, idx) => {
                  const isCurrentPosition = depth === idx;
                  const isMined = gems > idx;
                  const isPassed = depth > idx;

                  return (
                    <div 
                      key={idx}
                      className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all duration-300 ${
                        isCurrentPosition
                          ? 'bg-amber-950/80 border-amber-400 shadow-md shadow-amber-950/60 ring-2 ring-amber-400/40'
                          : isMined
                          ? 'bg-emerald-950/50 border-emerald-500/50'
                          : 'bg-[#1e130a] border-stone-800'
                      }`}
                    >
                      {/* Step Indicator */}
                      <span className="text-[9px] font-mono text-stone-400 mb-1">
                        Paso {idx}
                      </span>

                      {/* Token / Icon */}
                      <div className="text-xl h-7 flex items-center justify-center">
                        {isCurrentPosition ? (
                          <span className="animate-bounce" title="Minero Enano picando en este bloque">⛏️</span>
                        ) : isMined ? (
                          <span className="text-cyan-300 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]" title="Mithril Picado y Recolectado">💎</span>
                        ) : (
                          <span className="opacity-60 text-stone-500" title="Veta de mineral intacta">🪨</span>
                        )}
                      </div>

                      {/* Status Label */}
                      <span className={`text-[9px] font-mono font-bold mt-1 ${
                        isCurrentPosition
                          ? 'text-amber-300'
                          : isMined
                          ? 'text-emerald-400'
                          : 'text-stone-500'
                      }`}>
                        {isCurrentPosition ? 'Minando' : isMined ? 'Extraído' : 'Veta'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Battery / Mana & Status Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#191008] p-3 rounded-2xl border border-[#785331]/50 items-center">
              <div className="sm:col-span-2 space-y-1.5 bg-[#25170d] p-3 rounded-xl border border-amber-950/60">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-amber-300 font-serif font-bold">Maná de las Antorchas Mágicas:</span>
                  <span className="font-mono text-amber-400 font-bold">{battery}%</span>
                </div>
                <div className="w-full h-2.5 bg-stone-950 rounded-full overflow-hidden border border-[#523c27]">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-300 transition-all duration-300"
                    style={{ width: `${Math.max(0, Math.min(100, battery))}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col items-center justify-center bg-[#25170d] p-2.5 rounded-xl border border-amber-950/60 text-center">
                <span className="text-[10px] text-stone-400 font-serif">Instrucción en bucle:</span>
                <code className="text-amber-300 font-mono font-bold text-xs mt-0.5">
                  {isForLoopMission ? `for paso in range(${totalCrystalsNeeded}):` : 'while minero.mana > 20:'}
                </code>
                <span className="text-[10px] text-stone-400 font-mono mt-0.5">
                  picar() → avanzar()
                </span>
              </div>
            </div>
          </div>
        );
      }

      case 'inventory': {
        let hasChestOpened = false;
        for (const ev of activeEvents) {
          if (ev.type === 'chest_open') hasChestOpened = true;
        }

        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#856139]/40 pb-2">
              <div className="flex items-center gap-2">
                <Backpack size={14} className="text-amber-400" />
                <span className="text-xs font-rpg-title font-bold text-amber-300 tracking-wider">
                  BOLSA DE AVENTURERO Y COFRE ANCESTRAL
                </span>
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                hasChestOpened ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/50' : 'bg-stone-900 text-stone-400'
              }`}>
                {hasChestOpened ? '🔓 Cofre Abierto' : '🔒 Cofre Cerrado'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center bg-[#191008] p-3 rounded-2xl border border-[#785331]/50">
              {/* Treasure Chest Image Card */}
              <div className="relative rounded-xl overflow-hidden border border-amber-900/60 shadow-lg">
                <img
                  src={RPG_IMAGES.treasureChest}
                  alt="Cofre del Tesoro"
                  referrerPolicy="no-referrer"
                  className="w-full h-36 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-2.5">
                  <span className="text-xs font-serif font-bold text-amber-200">
                    {hasChestOpened ? '✨ ¡Tesoro Ancestral Revelado!' : 'Cofre Sellado con Runas'}
                  </span>
                  {hasChestOpened && (
                    <span className="text-[10px] font-mono bg-amber-500 text-stone-950 font-bold px-1.5 py-0.5 rounded">
                      +500 Oro
                    </span>
                  )}
                </div>
              </div>

              {/* Inventory Slots */}
              <div className="space-y-2 bg-[#25170d] p-3 rounded-xl border border-amber-950/60 text-xs">
                <span className="text-amber-300 font-serif font-bold block">
                  Ranuras de Mochila (Lista en Python):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(cfg.targetInventory || ['espada', 'escudo', 'pocion', 'llave_dorada']).map((item, idx) => (
                    <div key={idx} className="bg-[#191008] p-2 rounded-lg border border-amber-900/40 flex flex-col items-center text-center">
                      <span className="text-base mb-1">
                        {item.includes('espada') ? '⚔️' : item.includes('anillo') ? '💍' : item.includes('llave') ? '🗝️' : item.includes('pocion') ? '🧪' : '🛡️'}
                      </span>
                      <span className="text-[10px] font-mono text-amber-200 truncate w-full">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'boss_battle': {
        const bossMaxHp = cfg.bossHp || 100;
        let currentBossHp = bossMaxHp;
        let lastDmg = 0;

        for (const ev of activeEvents) {
          if (ev.payload?.bossHp !== undefined) currentBossHp = ev.payload.bossHp;
          if (ev.payload?.damage !== undefined) lastDmg = ev.payload.damage;
        }

        const bossHpPct = Math.max(0, Math.min(100, Math.round((currentBossHp / bossMaxHp) * 100)));

        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#856139]/40 pb-2">
              <div className="flex items-center gap-2">
                <Flame size={14} className="text-rose-500 animate-pulse" />
                <span className="text-xs font-rpg-title font-bold text-rose-400 tracking-wider">
                  ENCUENTRO DE JEFE: EL DRAGÓN ANCESTRAL
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-rose-400">
                {currentBossHp} / {bossMaxHp} HP
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#191008] p-3 rounded-2xl border border-rose-950/60 items-center">
              {/* Dragon Portrait */}
              <div className="relative rounded-xl overflow-hidden border-2 border-rose-700/80 shadow-lg shadow-rose-950/60">
                <img
                  src={RPG_IMAGES.dragonAvatar}
                  alt="Dragón Ancestral"
                  referrerPolicy="no-referrer"
                  className="w-full h-32 object-cover"
                />
                {lastDmg > 0 && (
                  <div className="absolute top-2 right-2 bg-rose-600 text-white font-mono font-bold text-xs px-2 py-0.5 rounded shadow">
                    -{lastDmg} HP
                  </div>
                )}
              </div>

              {/* Boss Stats & Bar */}
              <div className="sm:col-span-2 space-y-2 bg-[#25170d] p-3 rounded-xl border border-rose-900/40">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-serif font-bold text-rose-200">Vida del Dragón:</span>
                  <span className="font-mono text-rose-400">{bossHpPct}%</span>
                </div>
                <div className="w-full h-4 bg-stone-950 rounded-full overflow-hidden border border-rose-900/60">
                  <div
                    className="h-full bg-gradient-to-r from-rose-800 via-red-600 to-amber-500 transition-all duration-300"
                    style={{ width: `${bossHpPct}%` }}
                  />
                </div>
                <div className="text-[11px] text-stone-300 font-serif">
                  Ejecuta funciones modulares como <code className="text-amber-300 font-mono font-bold">calcular_ataque()</code> para infligir daño crítico.
                </div>
              </div>
            </div>
          </div>
        );
      }

      default:
        return (
          <div className="p-3 text-xs font-serif text-stone-300">
            Escenario táctico listo para la crónica de la partida.
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Tabletop Parchment Console Frame */}
      <div className="rpg-terminal-screen rounded-2xl p-4 sm:p-5 text-stone-200 relative overflow-hidden shadow-2xl">
        
        {/* Leather & Brass Console Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-[#856139]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#3d2514] border border-[#b45309]/60 flex items-center justify-center text-amber-400 shadow-sm">
              <Scroll size={15} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-rpg-title font-bold text-amber-300 tracking-wider">
                  CONSOLA DE ROL & CRÓNICA
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#382313] text-amber-200 border border-[#856139]/50">
                  {level.rpgContext?.partyRole || 'Héroe de Partida'}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-mono truncate max-w-[280px] sm:max-w-md">
                • {level.title}
              </p>
            </div>
          </div>

          {/* Action buttons on header */}
          <div className="flex items-center gap-2">
            {/* Speed toggle */}
            <button
              onClick={() => {
                sound.click();
                setPlaybackSpeed((prev) => (prev === 'normal' ? 'fast' : prev === 'fast' ? 'instant' : 'normal'));
              }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-[#2b1d12] hover:bg-[#382313] text-amber-300 border border-[#856139]/50 transition flex items-center gap-1"
              title="Velocidad de narración de la partida"
            >
              <FastForward size={12} />
              <span>{playbackSpeed === 'normal' ? '1x' : playbackSpeed === 'fast' ? '2x' : 'Inst.'}</span>
            </button>

            {/* Launch Turn */}
            <button
              onClick={onRunSimulation}
              disabled={isPlaying || isNarrating}
              className={`px-4 py-2 rounded-xl text-xs font-rpg-title font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 ${
                isPlaying || isNarrating
                  ? 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                  : 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 hover:brightness-110 shadow-amber-900/40 cursor-pointer'
              }`}
            >
              <Play size={13} className={isPlaying || isNarrating ? 'animate-spin' : 'fill-stone-950'} />
              <span>{isPlaying || isNarrating ? 'Turno en Curso...' : 'Tirar Turno de Rol'}</span>
            </button>
          </div>
        </div>

        {/* Tactical Graphical Stage */}
        <div className="bg-[#120d08] p-3.5 rounded-xl border border-[#856139]/40 mb-4 shadow-inner">
          {renderGraphicalTacticalDisplay()}
        </div>

        {/* Master's Narrative & Chronicle Terminal Log */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 border-b border-[#856139]/30 pb-1">
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Terminal size={13} />
              <span>Bitácora de la Partida & Tiradas del Máster</span>
            </span>
            <span className="text-stone-500">
              {events.length > 0 ? `Turno ${Math.min(currentEventIndex, events.length)} / ${events.length}` : 'Esperando tirada de iniciativa'}
            </span>
          </div>

          <div 
            id="rpg-chronicle-log" 
            className="h-44 sm:h-56 lg:h-64 2xl:h-72 overflow-y-auto bg-[#100b07] p-3 rounded-xl border border-[#856139]/30 font-mono text-xs space-y-2 shadow-inner"
          >
            {/* Initial DM Greeting / Briefing */}
            <div className="text-stone-400 italic">
              <span className="text-amber-500 font-bold not-italic">[MÁSTER DE ROL]: </span>
              "{level.rpgContext?.dmNarrative || 'La partida ha comenzado. Prepara tu código de Python y declara las acciones de tu personaje.'}"
            </div>

            {level.rpgContext?.diceCheck && (
              <div className="text-amber-300 text-[11px] bg-[#24170d] p-1.5 rounded border border-amber-900/40 flex items-center justify-between">
                <span>🎲 Dificultad de la Misión: {level.rpgContext.diceCheck}</span>
                <span className="text-stone-400 font-normal">Supera el reto para ganar</span>
              </div>
            )}

            {/* Turn by turn events revealed progressively */}
            {events.slice(0, currentEventIndex).map((ev, i) => (
              <div key={i} className="animate-fadeIn pl-2 border-l-2 border-amber-600/60 py-0.5">
                <span className="text-[10px] text-amber-500/80 mr-2 font-bold">T+{ev.time}</span>
                <span className={
                  ev.type.includes('crash') || ev.type.includes('alarm') || ev.type.includes('mistake')
                    ? 'text-rose-400'
                    : ev.type.includes('collect') || ev.type.includes('destroyed') || ev.type.includes('success') || ev.type.includes('defeated')
                    ? 'text-emerald-300 font-bold'
                    : 'text-stone-200'
                }>
                  {ev.message}
                </span>
              </div>
            ))}

            {/* If student code had print output */}
            {simulationOutcome?.terminalOutput && currentEventIndex >= events.length && (
              <div className="bg-[#1a120b] p-2 rounded border border-[#856139]/40 text-cyan-300 text-[11px] space-y-1">
                <span className="text-amber-400 font-bold block">[SALIDA DE PYTHON print()]:</span>
                <pre className="whitespace-pre-wrap">{simulationOutcome.terminalOutput}</pre>
              </div>
            )}

            {/* D20 Roll DM Chronicle Event */}
            {manualD20Roll && !manualD20Roll.isRolling && (
              <div
                className={`p-3 rounded-xl border text-xs font-mono flex items-start gap-3 transition-all animate-fadeIn ${
                  manualD20Roll.resultType === 'critical'
                    ? 'bg-amber-950/80 border-amber-400 text-amber-200 shadow-md shadow-amber-950/50'
                    : manualD20Roll.resultType === 'success'
                    ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200'
                    : manualD20Roll.resultType === 'fumble'
                    ? 'bg-red-950/50 border-red-500/50 text-rose-200'
                    : 'bg-[#24170d] border-[#856139]/50 text-stone-300'
                }`}
              >
                <div className="text-2xl shrink-0">🎲</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold font-rpg-title tracking-wide text-amber-300 text-[13px]">
                      {manualD20Roll.resultType === 'critical' && '⭐ ¡20 NATURAL! POTENCIADOR SUPREMO DE DOBLE XP'}
                      {manualD20Roll.resultType === 'success' && `✨ ¡POTENCIADOR TEMPORAL DE XP ACTIVADO! ([${manualD20Roll.value}] vs CD ${targetCd})`}
                      {manualD20Roll.resultType === 'fumble' && '⚠️ PIFIA (1 NATURAL)'}
                      {manualD20Roll.resultType === 'fail' && `TIRADA D20 ([${manualD20Roll.value}] vs CD ${targetCd})`}
                    </span>
                    {manualD20Roll.bonusXp > 0 && (
                      <span className="px-2.5 py-0.5 rounded bg-amber-500/25 text-amber-300 border border-amber-400 text-[10px] font-bold shrink-0 animate-pulse">
                        ⚡ +{manualD20Roll.bonusXp} XP Potenciador Temporal
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-95 text-stone-200">{manualD20Roll.message}</p>
                </div>
              </div>
            )}

            {/* Waiting prompt */}
            {events.length === 0 && !simulationOutcome && (
              <div className="text-stone-500 italic pt-2">
                &gt; Pulsa "Tirar Turno de Rol" para que el Máster evalúe tu código y narre el resultado del combate...
              </div>
            )}

            <div ref={chronicleEndRef} />
          </div>
        </div>

        {/* Interactive D20 Dice Roller Bar with Temporary Booster */}
        <div className="mt-3 pt-3 border-t border-[#856139]/30 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRollManualD20}
              disabled={manualD20Roll?.isRolling}
              className={`px-3 py-1.5 rounded-lg border font-mono flex items-center gap-2 transition active:scale-95 shadow-sm cursor-pointer ${
                manualD20Roll?.bonusXp && manualD20Roll.bonusXp > 0
                  ? 'bg-amber-950/90 border-amber-500 text-amber-300 shadow-amber-950/40 ring-1 ring-amber-400/50'
                  : 'bg-[#291b10] hover:bg-[#3d2716] border-[#b45309]/50 text-amber-300'
              }`}
              title={`Lanzar un D20 en la mesa del Máster contra CD ${targetCd} para activar un Potenciador Temporal`}
            >
              <Dices size={14} className={manualD20Roll?.isRolling ? 'animate-spin text-amber-300' : 'text-amber-400'} />
              <span>
                {manualD20Roll?.isRolling 
                  ? 'Rodando dado...' 
                  : manualD20Roll 
                  ? `Tirada D20: [ ${manualD20Roll.value} ]` 
                  : `Lanzar D20 (CD ${targetCd})`}
              </span>
            </button>

            {manualD20Roll && !manualD20Roll.isRolling && (
              <button
                onClick={handleRollManualD20}
                className="text-[11px] text-amber-400/80 hover:text-amber-300 underline underline-offset-2 cursor-pointer font-mono"
              >
                Volver a tirar
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {manualD20Roll?.bonusXp && manualD20Roll.bonusXp > 0 ? (
              <span className="px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-950 via-yellow-950 to-amber-950 border border-amber-400 text-amber-300 font-bold text-[11px] flex items-center gap-1 font-mono shadow-sm animate-pulse">
                ⚡ Potenciador Temporal Activo (+{manualD20Roll.bonusXp} XP extra al ganar)
              </span>
            ) : (
              <span className="text-[11px] text-stone-400 font-mono">
                🎲 Supera CD {targetCd} para activar Potenciador de XP (+50% / +100%)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Parchment Objectives List */}
      <div className="parchment-sheet rounded-2xl p-4 sm:p-5 text-[#292218] border border-[#d8c8b0]">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#d8c8b0]">
          <h4 className="text-xs font-rpg-title font-bold text-[#78350f] tracking-wider flex items-center gap-2">
            <Shield size={15} className="text-[#b45309]" />
            <span>CONDICIONES DE VICTORIA PARA EL MÁSTER:</span>
          </h4>
          <span className="text-[10px] font-mono text-stone-500">Misión Evaluada</span>
        </div>

        <div className="space-y-2">
          {cfg.objectives.map((obj, i) => {
            const isCompleted = simulationOutcome?.success;
            return (
              <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm font-serif">
                {isCompleted ? (
                  <CheckCircle2 size={17} className="text-emerald-700 shrink-0 mt-0.5 stroke-[2.5]" />
                ) : (
                  <Circle size={17} className="text-stone-400 shrink-0 mt-0.5" />
                )}
                <span className={isCompleted ? 'text-emerald-900 font-semibold line-through' : 'text-stone-800'}>
                  {obj}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Outcome Verdict Scroll Box */}
      {simulationOutcome && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-3 shadow-md transition-all ${
            simulationOutcome.success
              ? 'bg-[#edf7ed] border-emerald-600/50 text-emerald-950'
              : 'bg-[#fef9ee] border-amber-600/50 text-amber-950'
          }`}
        >
          {simulationOutcome.success ? (
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-amber-100 flex items-center justify-center shrink-0 mt-0.5 shadow">
              <Sparkles size={16} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-amber-700 text-amber-100 flex items-center justify-center shrink-0 mt-0.5 shadow">
              <AlertCircle size={16} />
            </div>
          )}
          <div className="flex-1 min-w-0 font-serif">
            <h5 className="font-rpg-title font-bold text-xs sm:text-sm tracking-wide mb-1">
              {simulationOutcome.success ? '★ ¡EL MÁSTER CONCEDE LA VICTORIA! ★' : '⚠️ EL MÁSTER SEÑALA UN AJUSTE TÁCTICO:'}
            </h5>
            <p className="leading-relaxed text-xs sm:text-sm">{simulationOutcome.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};
