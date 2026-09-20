import React, { useState, useEffect } from 'react';
import { Level } from '../../types';
import { GameSimulationEvent } from '../../utils/gameSimulator';

interface CannonGameViewProps {
  level: Level;
  simulationEvents: GameSimulationEvent[];
  isPlaying: boolean;
  onSimulationFinished?: () => void;
}

export const CannonGameView: React.FC<CannonGameViewProps> = ({
  level,
  simulationEvents,
  isPlaying,
  onSimulationFinished,
}) => {
  const cfg = level.gameConfig;
  const asteroids = cfg.asteroids || [];

  const [destroyedList, setDestroyedList] = useState<string[]>([]);
  const [activeLaser, setActiveLaser] = useState<{ distance: number; power: number } | null>(null);
  const [activeTargetAst, setActiveTargetAst] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    setDestroyedList([]);
    setActiveLaser(null);
    setActiveTargetAst(null);
    setScore(0);
  }, [level.id]);

  useEffect(() => {
    if (!isPlaying || simulationEvents.length === 0) return;

    setDestroyedList([]);
    setScore(0);
    let idx = 0;

    const interval = setInterval(() => {
      if (idx >= simulationEvents.length) {
        clearInterval(interval);
        setActiveLaser(null);
        setActiveTargetAst(null);
        if (onSimulationFinished) onSimulationFinished();
        return;
      }

      const ev = simulationEvents[idx];

      if (ev.type === 'cannon_fire') {
        setActiveLaser({ distance: ev.payload.distance, power: ev.payload.power });
        // Target asteroid
        const target = asteroids.find((a) => a.distance === ev.payload.distance);
        if (target) setActiveTargetAst(target.id);
      } else if (ev.type === 'asteroid_destroyed') {
        setDestroyedList((prev) => [...prev, ev.payload.id]);
        setScore((prev) => prev + 500);
      }

      idx++;
    }, 550);

    return () => clearInterval(interval);
  }, [isPlaying, simulationEvents, asteroids]);

  return (
    <div className="flex flex-col gap-3 w-full font-mono select-none">
      {/* 8-Bit Arcade Cabinet Screen */}
      <div className="bg-slate-900 border-4 border-slate-950 rounded-2xl p-3 shadow-2xl relative overflow-hidden">
        {/* Retro Header HUD */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-slate-800 text-[10px] font-pixel text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400">1P ORBIT-DEFENSE</span>
            <span className="text-amber-400">SCORE: {score.toString().padStart(5, '0')}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-400">
              BAJAS: {destroyedList.length}/{asteroids.length}
            </span>
            <span className="text-rose-400 animate-pulse">STAGE 01</span>
          </div>
        </div>

        {/* Space Battle CRT Canvas */}
        <div className="relative h-[320px] w-full bg-[#050515] border-4 border-[#1e1b4b] rounded-xl p-3 flex flex-col justify-between overflow-hidden shadow-[inset_0_0_25px_rgba(0,0,0,0.9)]">
          {/* CRT scanlines */}
          <div className="absolute inset-0 crt-overlay pointer-events-none z-20 opacity-60" />

          {/* Starfield & Nebula */}
          <div className="absolute inset-0 bg-[radial-gradient(#a5b4fc_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
          <div className="absolute top-0 right-10 w-28 h-28 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

          {/* Asteroids Grid (8-bit Invaders style) */}
          <div className="relative z-10 grid grid-cols-2 gap-3">
            {asteroids.map((ast) => {
              const isDestroyed = destroyedList.includes(ast.id);
              const isTargeted = activeTargetAst === ast.id;

              return (
                <div
                  key={ast.id}
                  className={`p-2.5 rounded-lg border-2 transition-all duration-300 flex items-center justify-between ${
                    isDestroyed
                      ? 'bg-red-950/20 border-red-900/40 opacity-30 scale-95'
                      : isTargeted
                      ? 'bg-rose-950/80 border-rose-400 shadow-[0_0_15px_#f43f5e] scale-105'
                      : 'bg-[#0f1123] border-[#312e81] shadow-md hover:border-cyan-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* 8-bit Asteroid Sprite */}
                    <div
                      className={`w-10 h-10 rounded border-2 flex items-center justify-center text-xl ${
                        isDestroyed
                          ? 'bg-slate-900 border-slate-700'
                          : 'bg-[#281b16] border-[#78350f] shadow-inner animate-pulse'
                      }`}
                    >
                      {isDestroyed ? '💥' : '🪨'}
                    </div>

                    <div>
                      <div className="text-[9px] font-pixel text-slate-100 flex items-center gap-1.5">
                        <span>{ast.name}</span>
                        {isTargeted && !isDestroyed && (
                          <span className="text-[7px] text-rose-400 animate-ping">LOCK</span>
                        )}
                      </div>
                      <div className="text-[8px] font-pixel text-cyan-400 mt-1">
                        DIST: {ast.distance} KM
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {isDestroyed ? (
                      <span className="text-[8px] font-pixel text-emerald-400">KO</span>
                    ) : (
                      <div className="text-[8px] font-pixel text-amber-400">
                        HP: {ast.hp}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Laser Firing Arcade FX */}
          {activeLaser && (
            <div className="relative z-20 flex flex-col items-center justify-center my-auto">
              <div className="w-full h-3 bg-gradient-to-r from-cyan-400 via-emerald-300 to-amber-300 rounded shadow-[0_0_15px_#22d3ee] animate-pulse" />
              <div className="mt-1 px-2.5 py-1 bg-slate-950 border-2 border-cyan-400 rounded text-[9px] font-pixel text-cyan-300 shadow-md">
                ⚡ DISPARO MW: {activeLaser.power} ➔ ALCANCE {activeLaser.distance} KM
              </div>
            </div>
          )}

          {/* Retro Orbital Cannon Turret at Bottom */}
          <div className="relative z-10 flex flex-col items-center pt-2 border-t-2 border-[#1e1b4b]">
            <div className="flex items-center gap-3">
              {/* Twin Turret pixel sprite */}
              <div className="flex items-center gap-1">
                <div className="w-3 h-7 bg-cyan-400 border-2 border-white rounded-t" />
                <div className="w-7 h-8 bg-slate-800 border-2 border-cyan-400 rounded-t-lg flex items-center justify-center text-xs">
                  🚀
                </div>
                <div className="w-3 h-7 bg-cyan-400 border-2 border-white rounded-t" />
              </div>
            </div>

            <div className="text-[8px] font-pixel text-cyan-400 mt-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>CAÑÓN DE PLASMA LISTO // POTENCIA = DIST * 2 + 10</span>
            </div>
          </div>
        </div>

        {/* 8-bit Arcade Footnote */}
        <div className="flex items-center justify-between mt-2 pt-1 text-[8px] font-pixel text-slate-500">
          <span>CALIBRACIÓN MATEMÁTICA</span>
          <span className="text-cyan-400/80">INSERT COIN TO CONTINUE</span>
        </div>
      </div>
    </div>
  );
};
