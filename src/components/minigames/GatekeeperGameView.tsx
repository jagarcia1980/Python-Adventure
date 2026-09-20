import React, { useState, useEffect } from 'react';
import { Level } from '../../types';
import { GameSimulationEvent } from '../../utils/gameSimulator';

interface GatekeeperGameViewProps {
  level: Level;
  simulationEvents: GameSimulationEvent[];
  isPlaying: boolean;
  onSimulationFinished?: () => void;
}

export const GatekeeperGameView: React.FC<GatekeeperGameViewProps> = ({
  level,
  simulationEvents,
  isPlaying,
  onSimulationFinished,
}) => {
  const cfg = level.gameConfig;
  const visitors = cfg.visitors || [];

  const [activeVisitorIdx, setActiveVisitorIdx] = useState(0);
  const [decisions, setDecisions] = useState<Record<string, 'allow' | 'block' | 'alarm'>>({});
  const [gateStatus, setGateStatus] = useState<'idle' | 'opened' | 'blocked' | 'alarm'>('idle');

  useEffect(() => {
    setActiveVisitorIdx(0);
    setDecisions({});
    setGateStatus('idle');
  }, [level.id]);

  useEffect(() => {
    if (!isPlaying || simulationEvents.length === 0) return;

    setDecisions({});
    setActiveVisitorIdx(0);
    let idx = 0;

    const interval = setInterval(() => {
      if (idx >= simulationEvents.length) {
        clearInterval(interval);
        setGateStatus('idle');
        if (onSimulationFinished) onSimulationFinished();
        return;
      }

      const ev = simulationEvents[idx];

      if (ev.type === 'gate_open') {
        setDecisions((prev) => ({ ...prev, [ev.payload.id]: 'allow' }));
        setGateStatus('opened');
      } else if (ev.type === 'gate_block') {
        setDecisions((prev) => ({ ...prev, [ev.payload.id]: 'block' }));
        setGateStatus('blocked');
      } else if (ev.type === 'alarm_trigger') {
        setDecisions((prev) => ({ ...prev, [ev.payload.id]: 'alarm' }));
        setGateStatus('alarm');
      }

      setActiveVisitorIdx((prev) => Math.min(visitors.length - 1, prev + 1));
      idx++;
    }, 600);

    return () => clearInterval(interval);
  }, [isPlaying, simulationEvents, visitors.length]);

  const activeVisitor = visitors[activeVisitorIdx] || visitors[0];

  return (
    <div className="flex flex-col gap-3 w-full font-mono select-none">
      {/* 8-bit Cyber Console Box */}
      <div className="bg-slate-900 border-4 border-slate-950 rounded-2xl p-3 shadow-2xl relative overflow-hidden">
        {/* Retro Header HUD */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-slate-800 text-[10px] font-pixel text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">1P GATE-SECURITY</span>
            <span className="text-slate-500">|</span>
            <span className="text-amber-400">PUESTOS: {Object.keys(decisions).length}/{visitors.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 animate-pulse">LOGIC-GATE 8-BIT</span>
          </div>
        </div>

        {/* Security Airlock CRT Canvas */}
        <div className="relative h-[320px] w-full bg-[#06100d] border-4 border-[#064e3b] rounded-xl p-3 flex flex-col justify-between overflow-hidden shadow-[inset_0_0_25px_rgba(0,0,0,0.9)]">
          {/* CRT scanlines */}
          <div className="absolute inset-0 crt-overlay pointer-events-none z-20 opacity-60" />

          {/* Top Blast Door Status with Hazard Stripes */}
          <div className="relative z-10 flex items-center justify-between">
            <div
              className={`px-3 py-1.5 rounded border-2 text-[9px] font-pixel transition-all flex items-center gap-2 ${
                gateStatus === 'opened'
                  ? 'bg-emerald-950 border-emerald-400 text-emerald-300 shadow-[0_0_12px_#34d399]'
                  : gateStatus === 'blocked'
                  ? 'bg-slate-900 border-slate-600 text-slate-400'
                  : gateStatus === 'alarm'
                  ? 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse shadow-[0_0_15px_#f43f5e]'
                  : 'bg-slate-900/80 border-[#064e3b] text-emerald-500/80'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-ping" />
              <span>
                {gateStatus === 'opened'
                  ? 'PUERTA: ACCESO AUTORIZADO'
                  : gateStatus === 'blocked'
                  ? 'PUERTA: ACCESO DENEGADO'
                  : gateStatus === 'alarm'
                  ? '¡¡ ALERTA MALWARE DETECTADO !!'
                  : 'COMPUERTA CERRADA EN ESPERA'}
              </span>
            </div>

            {/* Retro Hazard Stripes */}
            <div className="h-4 w-16 bg-[repeating-linear-gradient(45deg,#f59e0b,#f59e0b_5px,#1e293b_5px,#1e293b_10px)] rounded border border-amber-600" />
          </div>

          {/* Center Biometric Terminal (Green Phosphor Screen) */}
          <div className="relative z-10 flex items-center justify-center my-auto">
            {activeVisitor && (
              <div className="w-full max-w-sm bg-[#041d15]/90 border-2 border-emerald-500/70 rounded-xl p-3 shadow-lg flex items-center gap-3">
                {/* 8-bit Avatar frame */}
                <div className="w-16 h-16 rounded border-2 border-emerald-400 bg-slate-950 flex items-center justify-center text-3xl relative shadow-[inset_0_0_10px_#059669]">
                  {activeVisitor.avatar}
                  {activeVisitor.hasVirus && (
                    <div className="absolute -top-1.5 -right-1.5 px-1 py-0.5 bg-rose-600 text-white rounded text-[7px] font-pixel animate-bounce">
                      VIRUS
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-pixel text-emerald-200 truncate">
                      {activeVisitor.name}
                    </span>
                    <span
                      className={`text-[8px] font-pixel px-1.5 py-0.5 rounded ${
                        activeVisitor.isAlly
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                          : 'bg-amber-950 text-amber-300 border border-amber-500'
                      }`}
                    >
                      {activeVisitor.isAlly ? 'ALIADO' : 'INVITADO'}
                    </span>
                  </div>

                  <div className="text-[8px] font-pixel text-emerald-400/80 mt-1">
                    ROL: {activeVisitor.role}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-emerald-900 text-[8px] font-pixel">
                    <span className="text-cyan-300">
                      NIVEL: {activeVisitor.clearanceLevel}
                    </span>
                    <span
                      className={
                        activeVisitor.hasVirus
                          ? 'text-rose-400 font-bold animate-pulse'
                          : 'text-emerald-400'
                      }
                    >
                      {activeVisitor.hasVirus ? 'MALWARE: SI' : 'MALWARE: NO'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Visitor Queue Bar */}
          <div className="relative z-10 flex items-center gap-2 pt-2 border-t-2 border-[#064e3b] overflow-x-auto">
            <span className="text-[7px] font-pixel text-emerald-500/80 uppercase shrink-0">
              COLA:
            </span>
            {visitors.map((v, i) => {
              const dec = decisions[v.id];
              return (
                <div
                  key={v.id}
                  onClick={() => setActiveVisitorIdx(i)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded border cursor-pointer transition-all ${
                    i === activeVisitorIdx
                      ? 'border-emerald-400 bg-emerald-950 text-emerald-200'
                      : 'border-slate-800 bg-slate-950/70 text-slate-400 hover:border-emerald-600'
                  }`}
                >
                  <span className="text-sm">{v.avatar}</span>
                  <span className="text-[8px] font-pixel">{v.name.split(' ')[0]}</span>
                  {dec && (
                    <span
                      className={`text-[7px] font-pixel px-1 py-0.2 rounded ${
                        dec === 'allow'
                          ? 'bg-emerald-400 text-slate-950'
                          : dec === 'block'
                          ? 'bg-slate-700 text-slate-200'
                          : 'bg-rose-500 text-white animate-pulse'
                      }`}
                    >
                      {dec === 'allow' ? 'OK' : dec === 'block' ? 'DEN' : 'ALARM'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 8-bit Arcade Footnote */}
        <div className="flex items-center justify-between mt-2 pt-1 text-[8px] font-pixel text-slate-500">
          <span>EVALUADOR CONDICIONAL IF/ELIF/ELSE</span>
          <span className="text-emerald-500">CLEARANCE FILTER V2.0</span>
        </div>
      </div>
    </div>
  );
};
