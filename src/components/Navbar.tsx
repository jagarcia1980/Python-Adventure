import React from 'react';
import { 
  Scroll, 
  Flame, 
  Star, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Trophy, 
  BookOpen, 
  Play, 
  User, 
  CheckCircle2,
  Shield,
  Award
} from 'lucide-react';
import { UserProgress } from '../types';
import { getUserLevelTitle } from '../utils/storage';
import { sound } from '../utils/sound';

interface NavbarProps {
  progress: UserProgress;
  onOpenSandbox: () => void;
  onOpenBadges: () => void;
  onOpenCheatSheet: () => void;
  onOpenProfile: () => void;
  onToggleSound: () => void;
  lastSavedText: string;
  isAllCompleted?: boolean;
  onOpenLicense?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  progress,
  onOpenSandbox,
  onOpenBadges,
  onOpenCheatSheet,
  onOpenProfile,
  onToggleSound,
  lastSavedText,
  isAllCompleted,
  onOpenLicense,
}) => {
  const userLevel = getUserLevelTitle(progress.xp);

  return (
    <header className="sticky top-0 z-40 w-full leather-banner border-b-2 border-[#855d34] text-[#f7eedd] shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand / Title with RPG Font */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4a2e1b] border-2 border-[#b8864a] flex items-center justify-center shadow-md text-amber-300">
            <Scroll className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-rpg-title font-extrabold text-base sm:text-lg tracking-wider text-amber-200">
                Python Adventure
              </span>
              <span className="hidden md:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#4a2e1b] text-amber-300 border border-[#855d34]">
                MMRPG • 1º Bachillerato
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-100/70">
              <span className="text-amber-300 font-bold font-mono">Nv. {userLevel.level}</span>
              <span>•</span>
              <span className="truncate max-w-[140px] sm:max-w-none text-stone-200 font-serif">🛡️ {userLevel.title}</span>
            </div>
          </div>
        </div>

        {/* Center Tabletop RPG Counters */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak */}
          <div 
            id="streak-indicator"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#442918] border border-[#855d34] text-amber-300 text-xs sm:text-sm font-bold shadow-sm"
            title={`¡Racha de ${progress.streak} días consecutivos de práctica!`}
          >
            <Flame className="w-4 h-4 text-amber-400 fill-amber-500/40 animate-pulse" />
            <span>{progress.streak} <span className="hidden sm:inline font-normal text-amber-200/80">días</span></span>
          </div>

          {/* XP */}
          <div 
            id="xp-indicator"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#442918] border border-[#855d34] text-amber-200 text-xs sm:text-sm font-bold font-mono shadow-sm"
            title={`Experiencia total: ${progress.xp} XP`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{progress.xp} <span className="text-amber-300/70 font-sans">XP</span></span>
          </div>

          {/* Stars */}
          <div 
            id="stars-indicator"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#442918] border border-[#855d34] text-amber-300 text-xs sm:text-sm font-bold shadow-sm"
            title="Estrellas acumuladas en misiones"
          >
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>
              {Object.values(progress.levelScores || {}).reduce((acc: number, curr: { stars?: number }) => acc + (curr?.stars || 0), 0)}
            </span>
          </div>
        </div>

        {/* Right Actions (Parchment Tabs) */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Sandbox Playground */}
          <button
            id="btn-sandbox"
            onClick={() => {
              sound.playClick();
              onOpenSandbox();
            }}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#442918] hover:bg-[#57351f] text-amber-100 text-xs font-serif font-semibold border border-[#855d34] transition shadow-sm cursor-pointer"
            title="Abrir Taller Arcano Sandbox para probar código libremente"
          >
            <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Taller Arcano</span>
          </button>

          {/* Badges */}
          <button
            id="btn-badges"
            onClick={() => {
              sound.playClick();
              onOpenBadges();
            }}
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg bg-[#442918] hover:bg-[#57351f] text-amber-100 text-xs font-serif font-semibold border border-[#855d34] transition shadow-sm cursor-pointer"
            title="Ver mis insignias y logros de rol"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="hidden lg:inline">Reliquias</span>
            <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-[#2b190e] text-amber-300 border border-[#855d34]/60">
              {progress.unlockedBadges.length}
            </span>
          </button>

          {/* CheatSheet */}
          <button
            id="btn-cheatsheet"
            onClick={() => {
              sound.playClick();
              onOpenCheatSheet();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#442918] hover:bg-[#57351f] text-amber-100 text-xs font-serif font-semibold border border-[#855d34] transition shadow-sm cursor-pointer"
            title="Guía rápida y Grimorio de sintaxis Python"
          >
            <BookOpen className="w-4 h-4 text-amber-300" />
            <span className="hidden lg:inline">Grimorio</span>
          </button>

          {/* Adventurer License Certificate Button (when campaign is complete) */}
          {isAllCompleted && onOpenLicense && (
            <button
              id="btn-navbar-license"
              onClick={() => {
                sound.playClick();
                onOpenLicense();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-rpg-title font-bold text-xs border border-amber-300 shadow-md transition cursor-pointer animate-pulse"
              title="Ver tu Licencia Oficial de Aventurero y descargar Certificado PDF"
            >
              <Award className="w-4 h-4 text-stone-950" />
              <span>Licencia Oficial</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            id="btn-sound-toggle"
            onClick={onToggleSound}
            className="p-2 rounded-lg bg-[#442918] hover:bg-[#57351f] text-amber-200 border border-[#855d34] transition cursor-pointer"
            title={progress.soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
          >
            {progress.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-300" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-400" />
            )}
          </button>

          {/* Profile / Save status */}
          <button
            id="btn-profile"
            onClick={() => {
              sound.playClick();
              onOpenProfile();
            }}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-[#442918] hover:bg-[#57351f] text-amber-100 text-xs font-medium border border-[#855d34] transition cursor-pointer"
            title="Ficha de Aventurero y copia de seguridad"
          >
            <div className="w-6 h-6 rounded-full bg-amber-600/30 text-amber-300 flex items-center justify-center font-bold text-xs border border-amber-500/40">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="hidden sm:inline font-serif font-semibold">{progress.userName}</span>
            <div className="hidden xl:flex items-center gap-1 text-[10px] text-amber-300">
              <CheckCircle2 className="w-3 h-3 text-amber-400" />
              <span>Guardado</span>
            </div>
          </button>
        </div>
      </div>

      {/* Auto-save bar indicator with vintage manuscript styling */}
      <div className="w-full bg-[#27160c] border-t border-[#6d4624] px-4 py-1 text-[11px] text-amber-200/80 flex items-center justify-between font-serif">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>Progreso de campaña preservado en el pergamino del navegador ({lastSavedText})</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 font-mono text-[10px] text-amber-300/80">
          <span>{progress.completedLevels.length} misiones superadas</span>
          <span>•</span>
          <span>{progress.stats.totalChallengesSolved} retos de Python resueltos</span>
        </div>
      </div>
    </header>
  );
};
