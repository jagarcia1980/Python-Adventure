import React, { useState, useEffect } from 'react';
import { Level } from '../../types';
import { GameSimulationEvent } from '../../utils/gameSimulator';

interface BossBattleGameViewProps {
  level: Level;
  simulationEvents: GameSimulationEvent[];
  isPlaying: boolean;
  onSimulationFinished?: () => void;
}

export const BossBattleGameView: React.FC<BossBattleGameViewProps> = ({
  level,
  simulationEvents,
  isPlaying,
  onSimulationFinished,
}) => {
  const cfg = level.gameConfig;
  const bossMaxHp = cfg.bossHp || 100;
  const playerMaxHp = cfg.playerHp || 100;

  const [bossHp, setBossHp] = useState(bossMaxHp);
  const [playerHp, setPlayerHp] = useState(playerMaxHp);
  const [lastDamage, setLastDamage] = useState<{ amount: number; isCrit: boolean } | null>(null);
  const [activeRound, setActiveRound] = useState(0);
  const [isVictorious, setIsVictorious] = useState(false);
  const [combatLog, setCombatLog] = useState<string>('Esperando llamada a función calcular_ataque()...');

  useEffect(() => {
    setBossHp(bossMaxHp);
    setPlayerHp(playerMaxHp);
    setLastDamage(null);
    setActiveRound(0);
    setIsVictorious(false);
    setCombatLog('Esperando llamada a función calcular_ataque()...');
  }, [level.id, bossMaxHp, playerMaxHp]);

  useEffect(() => {
    if (!isPlaying || simulationEvents.length === 0) return;

    setBossHp(bossMaxHp);
    setPlayerHp(playerMaxHp);
    setLastDamage(null);
    setActiveRound(0);
    setIsVictorious(false);

    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= simulationEvents.length) {
        clearInterval(interval);
        if (onSimulationFinished) onSimulationFinished();
        return;
      }

      const ev = simulationEvents[idx];

      if (ev.type === 'combat_round') {
        setActiveRound(ev.payload.round);
        setLastDamage({ amount: ev.payload.damage, isCrit: ev.payload.isCrit });
        setBossHp(ev.payload.bossHp);
        setCombatLog(
          `RONDA ${ev.payload.round}: ¡Impacto por ${ev.payload.damage} daño! ${
            ev.payload.isCrit ? '★ GOLPE CRÍTICO x3 ★' : ''
          }`
        );
      } else if (ev.type === 'boss_defeated') {
        setIsVictorious(true);
        setBossHp(0);
        setCombatLog('¡¡ JEFE FINAL ELIMINADO !! Misión de Python completada con honores.');
      }

      idx++;
    }, 650);

    return () => clearInterval(interval);
  }, [isPlaying, simulationEvents, bossMaxHp, playerMaxHp]);

  const bossPercentage = Math.round((bossHp / bossMaxHp) * 100);
  const bossBars = Math.max(0, Math.min(10, Math.round(bossPercentage / 10)));

  return (
    <div className="flex flex-col gap-3 w-full font-mono select-none">
      {/* 8-bit Duel Arena Arcade Box */}
      <div className="bg-slate-900 border-4 border-slate-950 rounded-2xl p-3 shadow-2xl relative overflow-hidden">
        {/* Retro Header HUD */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-slate-800 text-[10px] font-pixel text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-rose-500 animate-pulse">VS BOSS</span>
            <span className="text-amber-400">RONDA {activeRound || 1}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-rose-400">
              BOSS: [{ '■'.repeat(bossBars) }{ '□'.repeat(10 - bossBars) }] {Math.max(0, bossHp)} HP
            </span>
          </div>
        </div>

        {/* 8-bit Battle Canvas */}
        <div className="relative h-[320px] w-full bg-[#18080f] border-4 border-[#881337] rounded-xl p-3 flex flex-col justify-between overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.95)]">
          {/* CRT scanlines */}
          <div className="absolute inset-0 crt-overlay pointer-events-none z-20 opacity-60" />

          {/* Neon Grid Floor Perspective */}
          <div className="absolute inset-0 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />

          {/* Boss Top Health Meter */}
          <div className="relative z-10 flex flex-col gap-1">
            <div className="flex justify-between items-center text-[9px] font-pixel">
              <span className="text-rose-300 flex items-center gap-1.5">
                <span>{cfg.bossAvatar || '👾'}</span>
                <span>{cfg.bossName || 'CYBER-BOSS'}</span>
              </span>
              <span className="text-slate-300">{bossHp} / {bossMaxHp} HP</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded border-2 border-rose-900 p-0.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-600 via-amber-500 to-yellow-400 transition-all duration-300"
                style={{ width: `${Math.max(0, bossPercentage)}%` }}
              />
            </div>
          </div>

          {/* Battle Center Stage: Hero vs Boss */}
          <div className="relative z-10 flex items-center justify-around my-auto">
            {/* Player 8-bit Avatar */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-18 h-18 rounded-xl bg-[#082f49] border-4 border-cyan-400 flex items-center justify-center text-3xl shadow-[0_0_15px_#06b6d4] animate-pulse">
                🧙‍♂️
              </div>
              <span className="text-[8px] font-pixel text-cyan-300">
                1P HÉROE
              </span>
            </div>

            {/* Combat Clashing Indicator */}
            <div className="flex flex-col items-center justify-center min-h-[70px]">
              {lastDamage && (
                <div className="flex flex-col items-center animate-bounce">
                  <span className="text-sm font-pixel text-amber-300">
                    ⚡ -{lastDamage.amount} HP
                  </span>
                  {lastDamage.isCrit && (
                    <span className="text-[7px] font-pixel bg-rose-600 text-white px-2 py-0.5 rounded shadow mt-1 animate-ping">
                      CRÍTICO x3!
                    </span>
                  )}
                </div>
              )}

              {isVictorious && (
                <div className="flex flex-col items-center gap-1 animate-bounce">
                  <span className="text-3xl">🏆</span>
                  <span className="text-[9px] font-pixel text-emerald-400">
                    ¡VICTORIA!
                  </span>
                </div>
              )}
            </div>

            {/* Boss 8-bit Sprite */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-20 h-20 rounded-xl flex items-center justify-center text-4xl shadow-2xl transition-all duration-300 border-4 ${
                  isVictorious
                    ? 'bg-slate-900 border-slate-700 opacity-30 scale-90'
                    : 'bg-[#4c0519] border-rose-500 shadow-[0_0_20px_#f43f5e] animate-pulse'
                }`}
              >
                {isVictorious ? '💀' : cfg.bossAvatar || '👾'}
              </div>
              <span className="text-[8px] font-pixel text-rose-300">
                {isVictorious ? 'K.O.' : cfg.bossName || 'BOSS'}
              </span>
            </div>
          </div>

          {/* Action RPG Dialogue Log Box */}
          <div className="relative z-10 bg-slate-950/90 border-2 border-rose-900/80 rounded-lg p-2 text-[8px] font-pixel text-slate-300">
            <span className="text-rose-400 mr-2">▶</span>
            <span>{combatLog}</span>
          </div>
        </div>

        {/* 8-bit Arcade Footnote */}
        <div className="flex items-center justify-between mt-2 pt-1 text-[8px] font-pixel text-slate-500">
          <span>PARÁMETROS Y RETORNO DE FUNCIONES</span>
          <span className="text-rose-400">BOSS FIGHT V1.0</span>
        </div>
      </div>
    </div>
  );
};
