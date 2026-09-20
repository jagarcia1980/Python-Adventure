import React, { useState, useEffect } from 'react';
import { Level } from '../../types';
import { GameSimulationEvent } from '../../utils/gameSimulator';

interface MinerGameViewProps {
  level: Level;
  simulationEvents: GameSimulationEvent[];
  isPlaying: boolean;
  onSimulationFinished?: () => void;
}

export const MinerGameView: React.FC<MinerGameViewProps> = ({
  level,
  simulationEvents,
  isPlaying,
  onSimulationFinished,
}) => {
  const cfg = level.gameConfig;
  const targetCrystals = cfg.targetCrystals || 4;

  const [depth, setDepth] = useState(0);
  const [minedCrystals, setMinedCrystals] = useState(0);
  const [battery, setBattery] = useState(cfg.initialBattery || 100);
  const [isDrilling, setIsDrilling] = useState(false);

  useEffect(() => {
    setDepth(0);
    setMinedCrystals(0);
    setBattery(cfg.initialBattery || 100);
    setIsDrilling(false);
  }, [level.id, cfg.initialBattery]);

  useEffect(() => {
    if (!isPlaying || simulationEvents.length === 0) return;

    setDepth(0);
    setMinedCrystals(0);
    setBattery(cfg.initialBattery || 100);
    let idx = 0;

    const interval = setInterval(() => {
      if (idx >= simulationEvents.length) {
        clearInterval(interval);
        setIsDrilling(false);
        if (onSimulationFinished) onSimulationFinished();
        return;
      }

      const ev = simulationEvents[idx];

      if (ev.type === 'miner_dig') {
        setIsDrilling(true);
        setMinedCrystals(ev.payload.crystals);
        setBattery(ev.payload.battery);
        setTimeout(() => setIsDrilling(false), 250);
      } else if (ev.type === 'miner_advance') {
        setDepth(ev.payload.depth);
        setBattery(ev.payload.battery);
      }

      idx++;
    }, 450);

    return () => clearInterval(interval);
  }, [isPlaying, simulationEvents, cfg.initialBattery]);

  const batteryBars = Math.max(0, Math.min(10, Math.round(battery / 10)));

  return (
    <div className="flex flex-col gap-3 w-full font-mono select-none">
      {/* 8-bit Industrial Arcade Box */}
      <div className="bg-slate-900 border-4 border-slate-950 rounded-2xl p-3 shadow-2xl relative overflow-hidden">
        {/* Retro Header HUD */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-slate-800 text-[10px] font-pixel text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-amber-400">1P STEAM-BOT</span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-400">PROF: {depth}M</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-400">
              GEMAS: {minedCrystals}/{targetCrystals}
            </span>
            <span
              className={
                battery > 30 ? 'text-cyan-400' : 'text-rose-400 animate-pulse'
              }
            >
              PWR: {battery}%
            </span>
          </div>
        </div>

        {/* Underground 8-bit Cave Scene */}
        <div className="relative h-[320px] w-full bg-[#181109] border-4 border-[#451a03] rounded-xl p-3 flex flex-col justify-between overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.95)]">
          {/* CRT scanline filter */}
          <div className="absolute inset-0 crt-overlay pointer-events-none z-20 opacity-60" />

          {/* Subterranean Rock Strata Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#78350f_2px,transparent_2px)] [background-size:16px_16px] opacity-25" />

          {/* Glowing Crystal Veins Embedded in Mine Walls */}
          <div className="relative z-10 flex items-center justify-between text-[9px] font-pixel text-amber-500/80">
            <div className="flex items-center gap-2">
              <span className="text-cyan-300 animate-pulse">◆ VETA DE NEÓN</span>
              <span>NIVEL SUELO -{depth}M</span>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: targetCrystals }).map((_, i) => (
                <span
                  key={i}
                  className={`text-xs ${
                    i < minedCrystals ? 'text-amber-300 scale-110' : 'text-slate-700'
                  }`}
                >
                  ◆
                </span>
              ))}
            </div>
          </div>

          {/* Mine Shaft Center Stage */}
          <div className="relative z-10 flex items-center justify-center my-auto">
            <div className="flex items-center gap-5">
              {/* 8-bit Steam Excavator Mech */}
              <div
                className={`relative w-20 h-20 rounded-xl bg-[#2a170a] border-4 border-amber-500 flex flex-col items-center justify-center text-3xl shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-transform duration-200 ${
                  isDrilling ? 'scale-110 rotate-6 shadow-amber-400' : ''
                }`}
              >
                {/* Steam chimney pipe with smoke puff */}
                <div className="absolute -top-3 left-3 text-xs animate-bounce">
                  💨
                </div>
                <div className="text-2xl">🤖</div>
                <div className="text-[7px] font-pixel text-amber-300 mt-0.5">
                  {isDrilling ? 'TALADRO' : 'MINER-V1'}
                </div>

                {/* Drill Bit Animation */}
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 text-lg">
                  {isDrilling ? '⚡' : '⛏️'}
                </div>
              </div>

              {/* Sparkles particle burst */}
              {isDrilling && (
                <div className="flex flex-col items-center animate-bounce">
                  <span className="text-lg">✨</span>
                  <span className="text-[8px] font-pixel text-amber-300">+1 ORE</span>
                </div>
              )}

              {/* 8-bit Mine Cart on Wooden Tracks */}
              <div className="w-18 h-18 rounded-lg bg-slate-950 border-2 border-slate-700 p-1 flex flex-col items-center justify-center shadow-lg">
                <span className="text-2xl">🛒</span>
                <span className="text-[8px] font-pixel text-cyan-300 mt-0.5">
                  {minedCrystals} GEMAS
                </span>
              </div>
            </div>
          </div>

          {/* Mine Track Floor (8-bit wooden sleepers & rails) */}
          <div className="relative z-10 w-full flex flex-col gap-1.5 pt-2 border-t-4 border-[#78350f]">
            {/* 8-bit Segmented Battery Gauge */}
            <div className="flex items-center justify-between text-[8px] font-pixel">
              <span className="text-slate-400">BATERÍA ENERGÍA:</span>
              <span className={battery > 25 ? 'text-emerald-400' : 'text-rose-400'}>
                [{'■'.repeat(batteryBars)}{'□'.repeat(10 - batteryBars)}] {battery}%
              </span>
            </div>

            {/* Depth Progress Marker */}
            <div className="w-full h-3 bg-slate-950 rounded border border-slate-800 p-0.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-cyan-400 transition-all duration-300"
                style={{
                  width: `${Math.min(100, (minedCrystals / targetCrystals) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* 8-bit Arcade Footnote */}
        <div className="flex items-center justify-between mt-2 pt-1 text-[8px] font-pixel text-slate-500">
          <span>BUCLES DE AUTOMATIZACIÓN FOR / WHILE</span>
          <span className="text-amber-500/80">RETRO DRILL 1989</span>
        </div>
      </div>
    </div>
  );
};
