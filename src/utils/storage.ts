import { UserProgress, Badge } from '../types';
import { ALL_BADGES } from '../data/badges';

const STORAGE_KEY = 'python_adventure_progress_v1';

export const DEFAULT_PROGRESS: UserProgress = {
  userName: 'Coder',
  xp: 0,
  streak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  activeDates: [new Date().toISOString().split('T')[0]],
  completedLevels: [],
  levelScores: {},
  unlockedBadges: [],
  stats: {
    totalChallengesSolved: 0,
    perfectLevels: 0,
    codeRuns: 0,
    streak: 1,
    timeSpentMinutes: 0,
  },
  soundEnabled: true,
  lastSavedAt: new Date().toISOString(),
};

export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveProgress(DEFAULT_PROGRESS);
      return DEFAULT_PROGRESS;
    }
    const parsed = JSON.parse(raw) as UserProgress;
    
    // Validate & compute streak based on today
    const today = new Date().toISOString().split('T')[0];
    const lastActive = parsed.lastActiveDate || today;
    
    let updatedStreak = parsed.streak || 1;
    const activeDates = Array.isArray(parsed.activeDates) ? parsed.activeDates : [today];
    
    if (lastActive !== today) {
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = yesterdayDate.toISOString().split('T')[0];

      if (lastActive === yesterday) {
        // Continuous streak!
        if (!activeDates.includes(today)) {
          activeDates.push(today);
          updatedStreak += 1;
        }
      } else {
        // Broken streak (more than 1 day missed)
        updatedStreak = 1;
        if (!activeDates.includes(today)) {
          activeDates.push(today);
        }
      }
    }

    const sanitizedCompletedLevels = Array.isArray(parsed.completedLevels)
      ? parsed.completedLevels.filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
      : [];
    const sanitizedUnlockedBadges = Array.isArray(parsed.unlockedBadges)
      ? parsed.unlockedBadges.filter((b): b is string => typeof b === 'string' && b.trim().length > 0)
      : [];

    const merged: UserProgress = {
      ...DEFAULT_PROGRESS,
      ...parsed,
      completedLevels: sanitizedCompletedLevels,
      unlockedBadges: sanitizedUnlockedBadges,
      streak: updatedStreak,
      lastActiveDate: today,
      activeDates,
      stats: {
        ...DEFAULT_PROGRESS.stats,
        ...(parsed.stats || {}),
      },
    };

    return merged;
  } catch (err) {
    console.error('Error loading progress, resetting to default:', err);
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  try {
    const dataToSave: UserProgress = {
      ...progress,
      lastSavedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (err) {
    console.error('Failed to save progress to localStorage:', err);
  }
}

export function resetProgress(): UserProgress {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  const fresh = { ...DEFAULT_PROGRESS, lastSavedAt: new Date().toISOString() };
  saveProgress(fresh);
  return fresh;
}

export function exportProgressJSON(progress: UserProgress): string {
  return JSON.stringify(progress, null, 2);
}

export function importProgressJSON(jsonString: string): UserProgress | null {
  try {
    const data = JSON.parse(jsonString) as UserProgress;
    if (!data || typeof data.xp !== 'number' || !Array.isArray(data.completedLevels)) {
      throw new Error('Formato inválido de archivo de guardado');
    }
    saveProgress(data);
    return data;
  } catch (err) {
    console.error('Error importing save file:', err);
    return null;
  }
}

// Check if any badges are unlocked and return newly unlocked ones
export function checkBadges(progress: UserProgress): { updatedBadges: string[]; newlyUnlocked: Badge[] } {
  const currentUnlocked = new Set(
    (progress.unlockedBadges || []).filter((b): b is string => typeof b === 'string' && b.length > 0)
  );
  const newlyUnlocked: Badge[] = [];
  const completed = (progress.completedLevels || []).filter(
    (id): id is string => typeof id === 'string' && id.length > 0
  );

  ALL_BADGES.forEach((badge) => {
    if (currentUnlocked.has(badge.id)) return;

    let unlocked = false;
    switch (badge.id) {
      case 'first_step':
        unlocked = completed.length >= 1;
        break;
      case 'terminal_master':
        unlocked = completed.filter((id) => id.startsWith('w1_')).length >= 3;
        break;
      case 'logic_guardian':
        unlocked = completed.filter((id) => id.startsWith('w2_')).length >= 2;
        break;
      case 'loop_wizard':
        unlocked = completed.filter((id) => id.startsWith('w3_')).length >= 2;
        break;
      case 'data_collector':
        unlocked = completed.filter((id) => id.startsWith('w4_')).length >= 2;
        break;
      case 'code_architect':
        unlocked = completed.filter((id) => id.startsWith('w5_')).length >= 2;
        break;
      case 'streak_3':
        unlocked = (progress.streak || 1) >= 3;
        break;
      case 'streak_7':
        unlocked = (progress.streak || 1) >= 7;
        break;
      case 'perfectionist':
        unlocked = (progress.stats?.perfectLevels || 0) >= 3;
        break;
      case 'bug_hunter':
        unlocked = completed.length >= 5;
        break;
      case 'xp_500':
        unlocked = (progress.xp || 0) >= 500;
        break;
      case 'xp_1000':
        unlocked = (progress.xp || 0) >= 1000;
        break;
      case 'experimenter':
        unlocked = (progress.stats?.codeRuns || 0) >= 5;
        break;
      case 'python_legend':
        unlocked = completed.length >= 11;
        break;
      default:
        break;
    }

    if (unlocked) {
      currentUnlocked.add(badge.id);
      newlyUnlocked.push({ ...badge, unlockedAt: new Date().toISOString() });
    }
  });

  return {
    updatedBadges: Array.from(currentUnlocked),
    newlyUnlocked,
  };
}

export function getUserLevelTitle(xp: number): { level: number; title: string; nextLevelXp: number; progressPercent: number } {
  const levels = [
    { level: 1, title: 'Novato de la Terminal', min: 0, max: 100 },
    { level: 2, title: 'Explorador de Variables', min: 100, max: 250 },
    { level: 3, title: 'Cadete de la Lógica', min: 250, max: 500 },
    { level: 4, title: 'Hacker de Bucles', min: 500, max: 850 },
    { level: 5, title: 'Alquimista de Funciones', min: 850, max: 1300 },
    { level: 6, title: 'Maestro Python', min: 1300, max: 2000 },
    { level: 7, title: 'Leyenda Cyber', min: 2000, max: 3000 },
  ];

  for (let i = 0; i < levels.length; i++) {
    const cur = levels[i];
    if (xp < cur.max || i === levels.length - 1) {
      const range = cur.max - cur.min;
      const currentInTier = Math.max(0, xp - cur.min);
      const percent = Math.min(100, Math.round((currentInTier / range) * 100));
      return {
        level: cur.level,
        title: cur.title,
        nextLevelXp: cur.max,
        progressPercent: percent,
      };
    }
  }

  return {
    level: 7,
    title: 'Leyenda Cyber',
    nextLevelXp: 3000,
    progressPercent: 100,
  };
}
