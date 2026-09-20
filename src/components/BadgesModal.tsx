import React, { useState } from 'react';
import { 
  X, 
  Trophy, 
  Lock, 
  Check, 
  Sparkles, 
  Flame, 
  Terminal, 
  ShieldAlert, 
  Repeat, 
  Layers, 
  Cpu, 
  Zap, 
  Bug, 
  Award, 
  Crown, 
  FlaskConical,
  Scroll
} from 'lucide-react';
import { Badge } from '../types';
import { ALL_BADGES } from '../data/badges';
import { sound } from '../utils/sound';
import { motion } from 'motion/react';

interface BadgesModalProps {
  unlockedBadgeIds: string[];
  onClose: () => void;
}

const BADGE_ICONS: Record<string, React.ElementType> = {
  Rocket: Sparkles,
  Terminal: Terminal,
  ShieldAlert: ShieldAlert,
  Repeat: Repeat,
  Layers: Layers,
  Cpu: Cpu,
  Flame: Flame,
  Zap: Zap,
  Sparkles: Sparkles,
  Bug: Bug,
  Award: Award,
  Crown: Crown,
  FlaskConical: FlaskConical,
  Trophy: Trophy,
};

export const BadgesModal: React.FC<BadgesModalProps> = ({
  unlockedBadgeIds,
  onClose,
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const filteredBadges = ALL_BADGES.filter((badge) => {
    const isUnlocked = unlockedBadgeIds.includes(badge.id);
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1a0f08]/85 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="parchment-sheet border-2 border-[#b8864a] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] w-full max-w-4xl text-[#292218] font-serif"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b-2 border-[#855d34] bg-[#2d1b10] text-amber-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#442918] text-amber-300 border border-[#b8864a] flex items-center justify-center shadow-md">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-rpg-title font-bold text-amber-200">Sala de Reliquias e Insignias</h2>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#442918] text-amber-300 border border-[#855d34]">
                  {unlockedBadgeIds.length} / {ALL_BADGES.length} Desbloqueadas
                </span>
              </div>
              <p className="text-xs text-stone-300">
                Supera misiones, mantén rachas de dados y resuelve retos de Python para coleccionar todas las reliquias.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-stone-300 hover:text-amber-100 hover:bg-[#442918] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 py-3 bg-[#f5ecdd] border-b border-[#d8c8b0] flex items-center gap-2">
          {(['all', 'unlocked', 'locked'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                sound.playClick();
                setFilter(tab);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filter === tab
                  ? 'bg-[#b45309] text-amber-100 shadow-sm border border-[#78350f]'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-[#eadeca]'
              }`}
            >
              {tab === 'all' && 'Todas las Reliquias'}
              {tab === 'unlocked' && `Desbloqueadas (${unlockedBadgeIds.length})`}
              {tab === 'locked' && `Por Desbloquear (${ALL_BADGES.length - unlockedBadgeIds.length})`}
            </button>
          ))}
        </div>

        {/* Badges Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBadges.map((badge) => {
            const isUnlocked = unlockedBadgeIds.includes(badge.id);
            const Icon = BADGE_ICONS[badge.icon] || Trophy;

            return (
              <div
                key={badge.id}
                className={`relative rounded-2xl p-4 border-2 transition-all duration-200 flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-[#fffdf8] border-[#b8864a] shadow-md'
                    : 'bg-[#ede4d4]/60 border-[#d8c8b0] opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      isUnlocked
                        ? 'bg-[#b45309] text-amber-100 shadow-md border border-[#78350f]'
                        : 'bg-[#dfd3c1] text-stone-500 border border-[#c8b79b]'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    {isUnlocked ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-600/40">
                        <Check className="w-3 h-3" />
                        Obtenida
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-stone-500 bg-[#dfd3c1] px-2 py-0.5 rounded-full border border-[#c8b79b]">
                        <Lock className="w-3 h-3" />
                        Bloqueada
                      </span>
                    )}
                  </div>

                  <h3 className={`text-base font-rpg-title font-bold mb-1 ${isUnlocked ? 'text-[#2b170c]' : 'text-stone-500'}`}>
                    {badge.title}
                  </h3>
                  <p className="text-xs text-[#574838] leading-relaxed mb-3">
                    {badge.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#d8c8b0] text-[11px] font-mono text-[#854d0e]">
                  <span className="font-bold">Requisito:</span> {badge.requirementText}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};
