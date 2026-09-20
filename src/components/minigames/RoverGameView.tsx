import React, { useState, useEffect } from 'react';
import { Level } from '../../types';
import { GameSimulationEvent } from '../../utils/gameSimulator';

interface RoverGameViewProps {
  level: Level;
  simulationEvents: GameSimulationEvent[];
  isPlaying: boolean;
  onSimulationFinished?: () => void;
}

export const RoverGameView: React.FC<RoverGameViewProps> = ({
  level,
  simulationEvents,
  isPlaying,
  onSimulationFinished,
}) => {
  const cfg = level.gameConfig;
  const gridW = cfg.gridWidth || 5;
  const gridH = cfg.gridHeight || 5;

  const [roverPos, setRoverPos] = useState({
    x: cfg.roverStart?.x ?? 0,
    y: cfg.roverStart?.y ?? 2,
    dir: cfg.roverStart?.dir ?? 'E',
  });
  const [collectedCrystals, setCollectedCrystals] = useState<string[]>([]);
  const [crashed, setCrashed] = useState<string | null>(null);
  const [docked, setDocked] = useState(false);
  const [battery, setBattery] = useState(100);

  const resetToStart = () => {
    setRoverPos({
      x: cfg.roverStart?.x ?? 0,
      y: cfg.roverStart?.y ?? 2,
      dir: cfg.roverStart?.dir ?? 'E',
    });
    setCollectedCrystals([]);
    setCrashed(null);
    setDocked(false);
    setBattery(100);
  };

  useEffect(() => {
    resetToStart();
  }, [level.id]);

  useEffect(() => {
    if (!isPlaying || simulationEvents.length === 0) return;

    resetToStart();
    let currentIdx = 0;

    const interval = setInterval(() => {
      if (currentIdx >= simulationEvents.length) {
        clearInterval(interval);
        if (onSimulationFinished) onSimulationFinished();
        return;
      }

      const ev = simulationEvents[currentIdx];
      setBattery((prev) => Math.max(10, prev - 8));

      if (ev.type === 'rover_move') {
        setRoverPos({ x: ev.payload.x, y: ev.payload.y, dir: ev.payload.dir });
      } else if (ev.type === 'rover_turn') {
        setRoverPos((prev) => ({ ...prev, dir: ev.payload.dir }));
      } else if (ev.type === 'rover_collect') {
        setCollectedCrystals((prev) => [...prev, ev.payload.id]);
      } else if (ev.type === 'rover_crash') {
        setCrashed(ev.message);
        if (ev.payload) {
          setRoverPos((prev) => ({ ...prev, x: ev.payload.x, y: ev.payload.y }));
        }
      } else if (ev.type === 'rover_dock') {
        setDocked(true);
      }

      currentIdx++;
    }, 450);

    return () => clearInterval(interval);
  }, [isPlaying, simulationEvents]);

  const totalCrystals = cfg.crystals?.length || 0;

  return (
    <div className="flex flex-col gap-3 w-full font-mono select-none">
      {/* 8-bit Arcade Console Frame */}
      <div className="bg-slate-900 border-4 border-slate-950 rounded-2xl p-3 shadow-2xl relative overflow-hidden">
        {/* Retro Top Marquee HUD */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-slate-800 text-[10px] font-pixel text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-rose-500 animate-pulse">● 1P</span>
            <span className="text-cyan-400">MARS-ROVER.EXE</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-amber-400">
              GEMAS:{' '}
              <span className="text-white">
                {collectedCrystals.length}/{totalCrystals}
              </span>
            </span>
            <span className="text-emerald-400">
              BAT:{' '}
              <span className="text-white">{battery}%</span>
            </span>
          </div>
        </div>

        {/* 8-Bit CRT Screen Area */}
        <div className="relative bg-[#1a0f0a] border-4 border-[#3d1e11] rounded-xl p-2.5 overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
          {/* CRT Scanline overlay */}
          <div className="absolute inset-0 crt-overlay pointer-events-none z-20 opacity-60" />

          {/* Mars Mountain Horizon Silhouette in Background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none flex flex-col justify-between">
            <div className="flex justify-between px-2 pt-1 text-[8px] font-pixel text-amber-500/40">
              <span>SECTOR: OLYMPUS MONS</span>
              <span>COORD_SYS: RETRO-8</span>
            </div>
            {/* Crater skyline */}
            <div className="w-full h-12 bg-gradient-to-t from-red-950/60 to-transparent" />
          </div>

          {/* 8-bit Tile Grid */}
          <div
            className="grid gap-1.5 w-full aspect-square max-h-[310px] mx-auto relative z-10 p-1"
            style={{
              gridTemplateColumns: `repeat(${gridW}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${gridH}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: gridH }).map((_, r) =>
              Array.from({ length: gridW }).map((_, c) => {
                const isRover = roverPos.x === c && roverPos.y === r;
                const isBase = cfg.baseStation?.x === c && cfg.baseStation?.y === r;
                const crystal = cfg.crystals?.find((cry) => cry.x === c && cry.y === r);
                const isCrystalCollected = crystal && collectedCrystals.includes(crystal.id);
                const obstacle = cfg.obstacles?.find((obs) => obs.x === c && obs.y === r);

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`relative rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                      isBase
                        ? 'bg-emerald-950/70 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                        : obstacle
                        ? 'bg-[#2a0e0e] border-[#7f1d1d]'
                        : 'bg-[#26150f]/80 border-[#4a2618] hover:border-[#693622]'
                    }`}
                  >
                    {/* Pixel Coordinate Label */}
                    <span className="absolute top-0.5 left-1 text-[7px] font-pixel text-amber-700/60 select-none">
                      {c},{r}
                    </span>

                    {/* Base Station: 8-Bit Habitat Dome */}
                    {isBase && !isRover && (
                      <div className="flex flex-col items-center">
                        <div className="text-xl animate-pulse">🛸</div>
                        <span className="text-[7px] font-pixel text-emerald-400 mt-0.5 tracking-tighter">
                          BASE
                        </span>
                      </div>
                    )}

                    {/* Crater / Lava fissure */}
                    {obstacle && (
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-lg filter drop-shadow-[0_0_4px_rgba(239,68,68,0.8)]">
                          🌋
                        </div>
                        <span className="text-[6px] font-pixel text-red-400 tracking-tighter">
                          CRATER
                        </span>
                      </div>
                    )}

                    {/* Power Crystal: 8-bit Glowing Gem */}
                    {crystal && !isCrystalCollected && (
                      <div className="flex flex-col items-center justify-center animate-bounce">
                        <div className="text-lg filter drop-shadow-[0_0_8px_#38bdf8]">
                          💎
                        </div>
                        <span className="text-[6px] font-pixel text-cyan-300">
                          +XP
                        </span>
                      </div>
                    )}

                    {/* 8-Bit Rover Sprite */}
                    {isRover && (
                      <div
                        className={`relative z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex flex-col items-center justify-center transition-transform duration-300 border-2 ${
                          crashed
                            ? 'bg-red-600 border-red-300 text-white animate-bounce'
                            : docked
                            ? 'bg-emerald-400 border-emerald-100 text-slate-950 shadow-[0_0_15px_#34d399]'
                            : 'bg-amber-400 border-amber-100 text-slate-950 shadow-[0_0_12px_#fbbf24]'
                        }`}
                      >
                        {/* Antenna indicator */}
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping absolute -top-1" />
                        <span className="text-base sm:text-xl">🤖</span>
                        {/* Direction pointer in 8-bit text */}
                        <span className="text-[7px] font-pixel font-bold bg-slate-900 text-cyan-300 px-1 rounded -mt-0.5">
                          {roverPos.dir}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Retro Sub-console Status Bar */}
          <div className="relative z-10 flex items-center justify-between mt-2 pt-2 border-t-2 border-[#3d1e11] text-[9px] font-pixel">
            <div className="flex items-center gap-2 text-amber-300">
              <span>POS: [{roverPos.x},{roverPos.y}]</span>
              <span className="text-slate-500">|</span>
              <span>DIR: {roverPos.dir}</span>
            </div>
            <div className="text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>SISTEMA ONLINE</span>
            </div>
          </div>
        </div>

        {/* Console Footers / 8-Bit Controller Hints */}
        <div className="flex items-center justify-between mt-2 pt-1 text-[8px] font-pixel text-slate-500">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-slate-800 text-cyan-400 rounded">CMD</span>
            <span>rover.avanzar()</span>
            <span>rover.girar_derecha()</span>
          </div>
          <span className="text-amber-500/80">CPU 8-BIT 6502</span>
        </div>
      </div>

      {/* Outcome Banner */}
      {crashed && (
        <div className="p-2.5 bg-red-950/80 border-2 border-red-500 text-red-300 text-xs rounded-xl font-pixel flex items-center gap-2">
          <span>⚠️ COLISIÓN:</span>
          <span className="font-sans text-xs">{crashed}</span>
        </div>
      )}

      {docked && (
        <div className="p-2.5 bg-emerald-950/80 border-2 border-emerald-500 text-emerald-300 text-xs rounded-xl font-pixel flex items-center gap-2">
          <span>★ MISIÓN CUMPLIDA:</span>
          <span className="font-sans text-xs">Muestras descargadas con éxito en el Hangar.</span>
        </div>
      )}
    </div>
  );
};
