/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Compass,
  Volume2,
  VolumeX,
  Trophy,
  Award,
  Sparkles
} from 'lucide-react';
import { Level, UserProgress, Badge } from './types';
import { WORLDS } from './data/curriculum';
import { ALL_BADGES } from './data/badges';
import { 
  loadProgress, 
  saveProgress, 
  checkBadges
} from './utils/storage';
import { sound } from './utils/sound';

// Components
import { AdventureMap } from './components/AdventureMap';
import { LevelPlayModal } from './components/LevelPlayModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { SandboxModal } from './components/SandboxModal';
import { BadgesModal } from './components/BadgesModal';
import { CheatSheetModal } from './components/CheatSheetModal';
import { ProfileModal } from './components/ProfileModal';
import { AdventurerLicenseModal } from './components/AdventurerLicenseModal';
import { AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress());
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  
  // Modals state
  const [completedLevelSummary, setCompletedLevelSummary] = useState<{
    level: Level;
    stars: number;
    xpEarned: number;
    unlockedBadges: Badge[];
  } | null>(null);
  
  const [isSandboxOpen, setIsSandboxOpen] = useState<boolean>(false);
  const [sandboxInitialCode, setSandboxInitialCode] = useState<string | null>(null);
  const [isBadgesOpen, setIsBadgesOpen] = useState<boolean>(false);
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isLicenseOpen, setIsLicenseOpen] = useState<boolean>(false);
  const [lastSavedText, setLastSavedText] = useState<string>('Sesión activa');

  // Initialize sound preferences
  useEffect(() => {
    sound.setEnabled(progress.soundEnabled);
  }, [progress.soundEnabled]);

  // Periodic save timestamp text update
  useEffect(() => {
    const updateTimeText = () => {
      if (!progress.lastSavedAt) return;
      const diffSec = Math.round((Date.now() - new Date(progress.lastSavedAt).getTime()) / 1000);
      if (diffSec < 15) setLastSavedText('Recién guardado');
      else if (diffSec < 60) setLastSavedText(`Guardado hace ${diffSec}s`);
      else setLastSavedText(`Guardado hace ${Math.round(diffSec / 60)} min`);
    };

    updateTimeText();
    const interval = setInterval(updateTimeText, 15000);
    return () => clearInterval(interval);
  }, [progress.lastSavedAt]);

  // Update progress helper with automatic badge evaluation and persistence
  const updateProgressAndSave = (updater: (prev: UserProgress) => UserProgress) => {
    setProgress((prev) => {
      const updated = updater(prev);
      const { updatedBadges, newlyUnlocked } = checkBadges(updated);
      const finalized: UserProgress = {
        ...updated,
        unlockedBadges: updatedBadges,
        lastSavedAt: new Date().toISOString(),
      };
      saveProgress(finalized);
      return finalized;
    });
  };

  // Toggle sound
  const handleToggleSound = () => {
    const next = !progress.soundEnabled;
    sound.setEnabled(next);
    if (next) sound.playClick();
    updateProgressAndSave((prev) => ({ ...prev, soundEnabled: next }));
  };

  // Level completion
  const handleLevelCompleted = (levelOrId: Level | string, stars: number, totalXpEarned?: number) => {
    let resolvedLevel: Level | undefined;
    if (typeof levelOrId === 'string') {
      for (const w of WORLDS) {
        const found = w.levels.find((l) => l.id === levelOrId);
        if (found) {
          resolvedLevel = found;
          break;
        }
      }
    } else {
      resolvedLevel = levelOrId;
    }

    if (!resolvedLevel || !resolvedLevel.id) return;
    const level = resolvedLevel;
    const xpReward = totalXpEarned ?? Math.round((level.xpReward || 50) * (stars / 3));

    const isNewCompletion = !progress.completedLevels.includes(level.id);

    updateProgressAndSave((prev) => {
      const sanitizedPrevCompleted = (prev.completedLevels || []).filter(
        (id): id is string => typeof id === 'string' && id.length > 0
      );
      const completedList = isNewCompletion
        ? [...sanitizedPrevCompleted, level.id]
        : sanitizedPrevCompleted;

      const previousScore = prev.levelScores[level.id];
      const bestStars = Math.max(stars, previousScore?.stars || 0);

      const isPerfect = stars === 3;

      const updatedStats = {
        ...prev.stats,
        totalChallengesSolved: prev.stats.totalChallengesSolved + 1,
        perfectLevels: isPerfect && (!previousScore || previousScore.stars < 3) 
          ? prev.stats.perfectLevels + 1 
          : prev.stats.perfectLevels,
      };

      const updatedScores = {
        ...prev.levelScores,
        [level.id]: {
          stars: bestStars,
          bestScore: Math.max(xpReward, previousScore?.bestScore || 0),
          completedAt: new Date().toISOString(),
        },
      };

      return {
        ...prev,
        xp: prev.xp + xpReward,
        completedLevels: completedList,
        levelScores: updatedScores,
        stats: updatedStats,
      };
    });

    // Determine if any badges were unlocked right now
    const currentCompleted = (progress.completedLevels || []).filter(
      (id): id is string => typeof id === 'string' && id.length > 0
    );
    const { newlyUnlocked } = checkBadges({
      ...progress,
      xp: progress.xp + xpReward,
      completedLevels: currentCompleted.includes(level.id) ? currentCompleted : [...currentCompleted, level.id],
      stats: {
        ...progress.stats,
        perfectLevels: stars === 3 ? progress.stats.perfectLevels + 1 : progress.stats.perfectLevels,
      }
    });

    setSelectedLevel(null);
    setCompletedLevelSummary({
      level,
      stars,
      xpEarned: xpReward,
      unlockedBadges: newlyUnlocked,
    });
  };

  // Handle code executed in sandbox
  const handleSandboxCodeExecuted = () => {
    updateProgressAndSave((prev) => ({
      ...prev,
      xp: prev.xp + 5, // Reward small XP for experimenting
      stats: {
        ...prev.stats,
        codeRuns: prev.stats.codeRuns + 1,
      },
    }));
  };

  // Open sandbox with specific snippet from cheat sheet
  const handleOpenSandboxWithSnippet = (codeSnippet: string) => {
    setIsCheatSheetOpen(false);
    setSandboxInitialCode(codeSnippet);
    setIsSandboxOpen(true);
  };

  // Check total campaign completion
  const allLevelIds = WORLDS.flatMap((w) => w.levels.map((l) => l.id));
  const isAllCampaignCompleted = allLevelIds.every((id) => (progress.completedLevels || []).includes(id));
  const totalStarsCount: number = (Object.values(progress.levelScores || {}) as Array<{ stars?: number }>).reduce(
    (acc: number, curr) => acc + (curr?.stars || 0),
    0
  );
  const isRankSPlayer = progress.xp >= 750 && (totalStarsCount >= 27 || progress.stats.perfectLevels >= 7);

  return (
    <div 
      className="min-h-screen text-[#261d15] flex flex-col font-sans selection:bg-[#b45309] selection:text-[#fffbeb] bg-cover bg-center bg-fixed bg-no-repeat relative"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(22, 13, 7, 0.46), rgba(15, 9, 5, 0.65)), url('https://images8.alphacoders.com/525/525171.jpg')`,
      }}
    >
      
      {/* Main Content Area */}
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* Grand Campaign Celebration Banner (when all 11 missions are completed) */}
        {isAllCampaignCompleted && (
          <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-amber-950 via-[#3d2311] to-amber-950 border-4 border-amber-400 shadow-2xl text-amber-100 flex flex-col md:flex-row items-center justify-between gap-5 animate-fadeIn">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 shrink-0 shadow-lg">
                <Trophy size={32} className="animate-bounce" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-[11px] font-mono font-bold text-amber-300 uppercase tracking-widest">
                  <Sparkles size={12} />
                  <span>¡CAMPAÑA DE PYTHON MMRPG CONQUISTADA AL 100%!</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-rpg-title font-bold text-white tracking-wide">
                  Tu Licencia Oficial de Aventurero ({isRankSPlayer ? 'Rango S' : 'Rango A'}) está Lista
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 font-serif max-w-xl">
                  Personaliza tu nombre oficial y descarga tu Certificado Real expedido por el Máster de la Mazmorra en formato PDF.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setIsLicenseOpen(true);
              }}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-stone-950 font-bold font-rpg-title text-sm tracking-wide shadow-xl flex items-center gap-2 cursor-pointer shrink-0 border-2 border-amber-200 transition active:scale-95 animate-pulse"
            >
              <Award size={18} />
              <span>Ver Licencia y Descargar PDF</span>
            </button>
          </div>
        )}

        {/* Adventure Worlds & Levels Map */}
        <section id="adventure-map-container" className="space-y-4">
          <div className="flex items-center justify-between px-2 bg-[#2a170c]/70 backdrop-blur-xs py-2 px-4 rounded-2xl border border-[#855d34]/60 shadow-md">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-rpg-title font-bold text-amber-100 tracking-wide drop-shadow-sm">
                Ruta de la Aventura & Misiones
              </h2>
            </div>
            <span className="text-xs text-amber-200/90 font-serif italic drop-shadow-xs">
              Haz clic en cualquier misión de la comitiva para comenzar
            </span>
          </div>

          <AdventureMap
            worlds={WORLDS}
            progress={progress}
            onSelectLevel={(level) => setSelectedLevel(level)}
          />
        </section>

      </main>

      {/* Tabletop Parchment Footer */}
      <footer className="w-full border-t border-[#855d34] bg-[#2d1b10] py-5 text-center text-xs text-[#d6c4b2] font-serif">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-amber-200">Python Adventure MMRPG</span>
            <span>•</span>
            <span>CDPC 1º Bachillerato I.E.S Virgen de la Victoria</span>
            <span className="text-[10px] text-amber-400/60 font-mono hidden sm:inline">({lastSavedText})</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-amber-200/90 font-mono text-[11px]">
            {isAllCampaignCompleted && (
              <button 
                onClick={() => {
                  sound.playClick();
                  setIsLicenseOpen(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-bold font-rpg-title text-xs shadow-md hover:brightness-110 transition flex items-center gap-1.5 cursor-pointer animate-pulse border border-amber-300"
              >
                <Award size={13} />
                <span>Licencia & PDF</span>
              </button>
            )}
            <button 
              onClick={() => setIsCheatSheetOpen(true)}
              className="hover:text-amber-100 underline decoration-amber-600 transition cursor-pointer"
            >
              Grimorio de Sintaxis
            </button>
            <button 
              onClick={() => setIsSandboxOpen(true)}
              className="hover:text-amber-100 underline decoration-amber-600 transition cursor-pointer"
            >
              Taller Arcano (Sandbox)
            </button>
            <button 
              onClick={() => setIsBadgesOpen(true)}
              className="hover:text-amber-100 underline decoration-amber-600 transition cursor-pointer flex items-center gap-1"
            >
              <Trophy size={12} className="text-amber-400" />
              <span>Insignias</span>
            </button>
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="hover:text-amber-100 underline decoration-amber-600 transition cursor-pointer"
            >
              Ficha & Copia de Seguridad
            </button>
            <button
              onClick={handleToggleSound}
              className="hover:text-amber-100 transition cursor-pointer flex items-center gap-1 px-2 py-0.5 rounded bg-[#422918] border border-[#855d34]/60 text-amber-300"
              title="Activar o desactivar efectos de sonido"
            >
              {progress.soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
              <span>{progress.soundEnabled ? 'Sonido ON' : 'Silencio'}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS (Portaled directly to document.body to stay strictly attached to viewport) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {/* Active Level Playing Modal */}
          {selectedLevel && (
            <LevelPlayModal
              key="level-play-modal"
              level={selectedLevel}
              onClose={() => setSelectedLevel(null)}
              onCompleteLevel={handleLevelCompleted}
            />
          )}

          {/* Level Completed Celebration Modal */}
          {completedLevelSummary && (
            <LevelCompleteModal
              key="level-complete-modal"
              level={completedLevelSummary.level}
              stars={completedLevelSummary.stars}
              xpEarned={completedLevelSummary.xpEarned}
              unlockedBadges={completedLevelSummary.unlockedBadges}
              isAllCompleted={isAllCampaignCompleted}
              onOpenLicense={() => {
                setCompletedLevelSummary(null);
                setIsLicenseOpen(true);
              }}
              onContinue={() => setCompletedLevelSummary(null)}
            />
          )}

          {/* Sandbox Terminal Playground Modal */}
          {isSandboxOpen && (
            <SandboxModal
              key="sandbox-modal"
              initialCode={sandboxInitialCode}
              onClose={() => {
                setIsSandboxOpen(false);
                setSandboxInitialCode(null);
              }}
              onCodeExecuted={handleSandboxCodeExecuted}
            />
          )}

          {/* Badges Gallery Modal */}
          {isBadgesOpen && (
            <BadgesModal
              key="badges-modal"
              unlockedBadgeIds={progress.unlockedBadges}
              onClose={() => setIsBadgesOpen(false)}
            />
          )}

          {/* CheatSheet / Syntax Reference Modal */}
          {isCheatSheetOpen && (
            <CheatSheetModal
              key="cheatsheet-modal"
              onClose={() => setIsCheatSheetOpen(false)}
              onOpenSandboxWithCode={handleOpenSandboxWithSnippet}
            />
          )}

          {/* Profile & Save Transfer Modal */}
          {isProfileOpen && (
            <ProfileModal
              key="profile-modal"
              progress={progress}
              isAllCompleted={isAllCampaignCompleted}
              onOpenLicense={() => {
                setIsProfileOpen(false);
                setIsLicenseOpen(true);
              }}
              onClose={() => setIsProfileOpen(false)}
              onUpdateProgress={(updated) => {
                setProgress(updated);
                saveProgress(updated);
              }}
            />
          )}

          {/* Adventurer License & Certificate PDF Modal */}
          {isLicenseOpen && (
            <AdventurerLicenseModal
              key="license-modal"
              progress={progress}
              onClose={() => setIsLicenseOpen(false)}
              onUpdateName={(newName) => {
                updateProgressAndSave((prev) => ({
                  ...prev,
                  userName: newName,
                }));
              }}
            />
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
}
