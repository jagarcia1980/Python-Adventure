import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, Sparkles, Trophy, ArrowRight, Award, Scroll } from 'lucide-react';
import { Level, Badge } from '../types';
import { sound } from '../utils/sound';
import { motion } from 'motion/react';

interface LevelCompleteModalProps {
  level: Level;
  stars: number;
  xpEarned: number;
  unlockedBadges: Badge[];
  onContinue: () => void;
  isAllCompleted?: boolean;
  onOpenLicense?: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  level,
  stars,
  xpEarned,
  unlockedBadges,
  onContinue,
  isAllCompleted,
  onOpenLicense,
}) => {
  useEffect(() => {
    // Launch celebratory confetti burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#b45309', '#d97706', '#15803d', '#854d0e'],
    });

    if (unlockedBadges.length > 0) {
      setTimeout(() => {
        sound.playBadgeUnlock();
      }, 500);
    }
  }, [unlockedBadges]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a0f08]/85 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 12 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="parchment-sheet border-4 border-[#b8864a] rounded-3xl shadow-2xl p-6 sm:p-8 text-center overflow-hidden w-full max-w-md text-[#292218] font-serif"
      >
        {/* Level Title & Header */}
        <div className="space-y-1 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f3ecde] border border-[#cfbeaa] text-[#78350f] text-xs font-rpg-title font-bold uppercase tracking-wider shadow-xs">
            <Trophy className="w-3.5 h-3.5 text-[#b45309]" />
            ¡Misión Superada!
          </div>
          <h2 className="text-2xl font-bold font-rpg-title text-[#2b170c] mt-2 tracking-tight">
            {level.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#574838]">
            {level.subtitle}
          </p>
        </div>

        {/* Stars */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`transition-all duration-500 transform ${
                s <= stars ? 'scale-110 text-amber-500' : 'text-stone-300'
              }`}
            >
              <Star className={`w-10 h-10 ${s <= stars ? 'fill-amber-500 filter drop-shadow' : ''}`} />
            </div>
          ))}
        </div>

        {/* Rewards Box on Parchment Card */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#f5ecdd] border border-[#d8c8b0] mb-6">
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-xs text-[#786450] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#b45309]" />
              XP Ganada
            </span>
            <span className="text-xl font-black font-mono text-[#854d0e] mt-0.5">
              +{xpEarned}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-2 border-l border-[#d8c8b0]">
            <span className="text-xs text-[#786450] flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              Rendimiento
            </span>
            <span className="text-sm font-bold text-[#2b170c] mt-1">
              {stars === 3 ? '¡Sin Fallos!' : stars === 2 ? 'Muy Bueno' : 'Superado'}
            </span>
          </div>
        </div>

        {/* Unlocked Badges announcement if any */}
        {unlockedBadges.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-[#fffdf8] border-2 border-[#b8864a] text-left shadow-sm">
            <span className="text-xs font-rpg-title font-bold text-[#78350f] flex items-center gap-1.5 uppercase tracking-wider mb-2">
              <Trophy className="w-4 h-4 text-[#b45309]" />
              ¡Nueva Reliquia Desbloqueada!
            </span>
            {unlockedBadges.map((badge) => (
              <div key={badge.id} className="flex items-center gap-3 mt-2">
                <div className="w-10 h-10 rounded-xl bg-[#b45309] text-amber-100 flex items-center justify-center font-bold shadow-xs">
                  ★
                </div>
                <div>
                  <h4 className="text-sm font-bold font-rpg-title text-[#2b170c]">{badge.title}</h4>
                  <p className="text-xs text-[#574838]">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Continue / License Buttons */}
        <div className="space-y-2.5">
          {isAllCompleted && onOpenLicense && (
            <button
              id="btn-level-complete-license"
              onClick={() => {
                sound.playClick();
                onContinue();
                onOpenLicense();
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-stone-950 font-serif font-black text-sm sm:text-base shadow-xl shadow-amber-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-200 animate-pulse"
            >
              <Award className="w-5 h-5 text-stone-950" />
              <span>¡Obtener Licencia & Certificado PDF!</span>
            </button>
          )}

          <button
            id="btn-level-complete-continue"
            onClick={() => {
              sound.playClick();
              onContinue();
            }}
            className="w-full py-3 rounded-2xl bg-[#b45309] hover:bg-[#92400e] text-amber-100 font-serif font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-400/30"
          >
            <span>{isAllCompleted ? 'Volver al Mapa del Mundo' : 'Continuar Aventura'}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

      </motion.div>
    </motion.div>
  );
};
