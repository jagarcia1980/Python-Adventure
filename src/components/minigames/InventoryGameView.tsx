import React, { useState, useEffect } from 'react';
import { Level } from '../../types';
import { GameSimulationEvent } from '../../utils/gameSimulator';

interface InventoryGameViewProps {
  level: Level;
  simulationEvents: GameSimulationEvent[];
  isPlaying: boolean;
  onSimulationFinished?: () => void;
}

const ITEM_ICONS: Record<string, { icon: string; label: string; color: string }> = {
  'anillo de teletransporte': { icon: '💍', label: 'ANILLO TELEPORT', color: 'border-cyan-400 bg-[#083344]' },
  anillo_de_teletransporte: { icon: '💍', label: 'ANILLO TELEPORT', color: 'border-cyan-400 bg-[#083344]' },
  espada_laser: { icon: '🗡️', label: 'ESPADA', color: 'border-cyan-500 bg-[#082f49]' },
  pocion_vida: { icon: '🧪', label: 'POCIÓN', color: 'border-emerald-500 bg-[#064e3b]' },
  llave_dorada: { icon: '🔑', label: 'LLAVE', color: 'border-amber-400 bg-[#451a03]' },
  escudo: { icon: '🛡️', label: 'ESCUDO', color: 'border-blue-500 bg-[#172554]' },
  veneno: { icon: '☠️', label: 'VENENO', color: 'border-purple-500 bg-[#3b0764]' },
  rubi: { icon: '💎', label: 'RUBÍ', color: 'border-rose-500 bg-[#4c0519]' },
  mapa: { icon: '🗺️', label: 'MAPA', color: 'border-indigo-500 bg-[#1e1b4b]' },
};

export const InventoryGameView: React.FC<InventoryGameViewProps> = ({
  level,
  simulationEvents,
  isPlaying,
  onSimulationFinished,
}) => {
  const cfg = level.gameConfig;
  const initialItems = cfg.initialInventory || [];

  const [currentMochila, setCurrentMochila] = useState<string[]>(initialItems);
  const [chestOpen, setChestOpen] = useState(false);

  useEffect(() => {
    setCurrentMochila(cfg.initialInventory || []);
    setChestOpen(false);
  }, [level.id, cfg.initialInventory]);

  useEffect(() => {
    if (!isPlaying || simulationEvents.length === 0) return;

    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= simulationEvents.length) {
        clearInterval(interval);
        if (onSimulationFinished) onSimulationFinished();
        return;
      }

      const ev = simulationEvents[idx];

      if (ev.type === 'chest_open') {
        setChestOpen(true);
      } else if ((ev.type === 'inventory_sync' || ev.type === 'inventory_success') && ev.payload?.mochila) {
        setCurrentMochila(ev.payload.mochila);
      }

      idx++;
    }, 450);

    return () => clearInterval(interval);
  }, [isPlaying, simulationEvents]);

  return (
    <div className="flex flex-col gap-3 w-full font-mono select-none">
      {/* 8-bit RPG Quest Box */}
      <div className="bg-slate-900 border-4 border-slate-950 rounded-2xl p-3 shadow-2xl relative overflow-hidden">
        {/* Retro Header HUD */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-slate-800 text-[10px] font-pixel text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-purple-400">1P RPG-INVENTARIO</span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-300">LISTAS PYTHON</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={chestOpen ? 'text-amber-300' : 'text-slate-400'}>
              COFRE: {chestOpen ? 'ABIERTO ★' : 'CERRADO 🔒'}
            </span>
          </div>
        </div>

        {/* 8-bit Dungeon Chamber Canvas */}
        <div className="relative h-[320px] w-full bg-[#0a0f1d] border-4 border-[#1e3a8a] rounded-xl p-3 flex flex-col justify-between overflow-hidden shadow-[inset_0_0_25px_rgba(0,0,0,0.9)]">
          {/* CRT scanlines */}
          <div className="absolute inset-0 crt-overlay pointer-events-none z-20 opacity-60" />

          {/* Dungeon Cobblestone Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />

          {/* Golden Legendary Chest in Altar */}
          <div className="relative z-10 flex items-center justify-center pt-2">
            <div
              className={`p-3 rounded-xl border-4 transition-all duration-500 flex items-center gap-4 ${
                chestOpen
                  ? 'bg-[#3b2308] border-amber-400 shadow-[0_0_25px_#f59e0b] scale-105'
                  : 'bg-[#111827] border-slate-700'
              }`}
            >
              <div className="text-4xl animate-bounce">
                {chestOpen ? '✨👑' : '🔒📦'}
              </div>
              <div>
                <div className="text-[10px] font-pixel text-amber-300">
                  {chestOpen ? '¡TESORO LEGENDARIO DESBLOQUEADO!' : 'COFRE DEL SANTUARIO'}
                </div>
                <div className="text-[8px] font-pixel text-slate-400 mt-1">
                  {chestOpen
                    ? 'RECOMPENSA: CORONA PITÓN +500 XP'
                    : 'CONDICIÓN: "llave_dorada" in mochila'}
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Grid: 8-bit Item Slots */}
          <div className="relative z-10 flex flex-col gap-2 pt-2 border-t-2 border-[#1e3a8a]">
            <div className="flex justify-between items-center text-[8px] font-pixel text-cyan-300">
              <span>RANURAS MOCHILA [ÍNDICES 0..3]</span>
              <span>OCUPADO: {currentMochila.length}/4</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, slotIdx) => {
                const itemKey = currentMochila[slotIdx];
                const itemInfo = itemKey
                  ? ITEM_ICONS[itemKey] || {
                      icon: '📦',
                      label: itemKey.toUpperCase(),
                      color: 'border-slate-700 bg-slate-900',
                    }
                  : null;

                return (
                  <div
                    key={slotIdx}
                    className={`h-20 rounded-lg border-2 flex flex-col items-center justify-center p-1 transition-all ${
                      itemInfo
                        ? `${itemInfo.color} shadow-md`
                        : 'border-dashed border-slate-800 bg-slate-950/60'
                    }`}
                  >
                    {itemInfo ? (
                      <>
                        <span className="text-2xl animate-pulse">{itemInfo.icon}</span>
                        <span className="text-[8px] font-pixel text-slate-100 truncate mt-1">
                          {itemInfo.label}
                        </span>
                        <span className="text-[7px] font-pixel text-amber-400/80">
                          [{slotIdx}]
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm opacity-20">📭</span>
                        <span className="text-[7px] font-pixel text-slate-600 mt-1">
                          VACÍO
                        </span>
                        <span className="text-[6px] font-pixel text-slate-700">
                          [{slotIdx}]
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 8-bit Arcade Footnote */}
        <div className="flex items-center justify-between mt-2 pt-1 text-[8px] font-pixel text-slate-500">
          <span>OPERACIONES: .append() | .remove() | in</span>
          <span className="text-purple-400">QUEST HERO INV</span>
        </div>
      </div>
    </div>
  );
};
