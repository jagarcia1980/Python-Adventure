import React from 'react';
import { 
  Star, 
  Lock, 
  Check, 
  Play, 
  Trophy, 
  Sparkles, 
  Terminal, 
  Database, 
  Calculator, 
  ToggleRight, 
  GitBranch, 
  Split, 
  Repeat, 
  Clock, 
  Zap, 
  Rocket, 
  ListOrdered, 
  PlusCircle, 
  Layers, 
  Cpu, 
  CornerDownLeft, 
  Crown,
  ShieldCheck,
  Compass,
  ShieldAlert,
  Flame,
  Bug,
  BookOpen
} from 'lucide-react';
import { World, Level, UserProgress } from '../types';
import { sound } from '../utils/sound';

interface AdventureMapProps {
  worlds: World[];
  progress: UserProgress;
  onSelectLevel: (level: Level) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Terminal,
  Database,
  Calculator,
  Sparkles,
  Trophy,
  ToggleRight,
  GitBranch,
  Split,
  Layers,
  ShieldCheck,
  Repeat,
  Clock,
  Zap,
  Rocket,
  ListOrdered,
  PlusCircle,
  Cpu,
  CornerDownLeft,
  Crown,
  Compass,
  ShieldAlert,
  Flame,
  Bug,
};

export const AdventureMap: React.FC<AdventureMapProps> = ({
  worlds,
  progress,
  onSelectLevel,
}) => {
  const isLevelUnlocked = (worldIdx: number, levelIdx: number): boolean => {
    if (worldIdx === 0 && levelIdx === 0) return true;
    
    if (levelIdx > 0) {
      const prevLevel = worlds[worldIdx].levels[levelIdx - 1];
      return progress.completedLevels.includes(prevLevel.id);
    }
    
    if (worldIdx > 0) {
      const prevWorld = worlds[worldIdx - 1];
      const lastLevelOfPrevWorld = prevWorld.levels[prevWorld.levels.length - 1];
      return progress.completedLevels.includes(lastLevelOfPrevWorld.id);
    }
    
    return false;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-12">
      {worlds.map((world, worldIdx) => {
        const completedInWorld = world.levels.filter(l => progress.completedLevels.includes(l.id)).length;
        const totalInWorld = world.levels.length;

        return (
          <section 
            key={world.id}
            id={`world-section-${world.id}`}
            className="relative rounded-3xl parchment-sheet border-2 border-[#cfbeaa] overflow-hidden p-6 sm:p-8 shadow-md"
          >
            {/* World Banner Header with RPG Scene Artwork */}
            <div className="pb-6 mb-8 border-b border-[#d8c8b0] space-y-4">
              {world.worldImage && (
                <div className="relative w-full h-40 sm:h-48 rounded-2xl overflow-hidden border-2 border-[#855d34] shadow-md group">
                  <img
                    src={world.worldImage}
                    alt={world.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2a180e]/95 via-[#2a180e]/40 to-transparent" />
                  
                  {/* Act Pill */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="text-[11px] font-rpg-title font-bold tracking-widest uppercase px-3 py-1 rounded-md bg-[#2a180e]/90 text-amber-200 border border-[#b45309]">
                      {world.actTitle || `Acto ${world.number}`}
                    </span>
                  </div>

                  {/* World Details Overlay */}
                  <div className="absolute bottom-3 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-rpg-title font-bold text-amber-100 drop-shadow-md">
                        {world.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-amber-200/90 font-serif drop-shadow line-clamp-1">
                        {world.subtitle}
                      </p>
                    </div>
                    
                    {/* Completion Meter */}
                    <div className="shrink-0 flex items-center gap-2.5 bg-[#2a180e]/85 px-3 py-1.5 rounded-lg border border-[#855d34] backdrop-blur-sm self-start sm:self-auto">
                      <div className="w-20 sm:w-28 h-2 bg-[#442918] rounded-full overflow-hidden border border-[#855d34]/60">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
                          style={{ width: `${(completedInWorld / totalInWorld) * 100}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono font-bold text-amber-300">
                        {completedInWorld}/{totalInWorld}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Master's Chronicle Lore Quote */}
              {world.worldLore && (
                <div className="bg-[#f3ecde] border border-[#d8c8b0] rounded-xl p-4 text-xs text-[#3b2b1d] flex items-start gap-3 shadow-sm">
                  <span className="text-xl shrink-0 mt-0.5">🎲</span>
                  <div className="space-y-1 font-serif">
                    <span className="text-[11px] font-rpg-title text-[#854d0e] font-bold uppercase tracking-wider block">
                      Crónica del Máster de Rol:
                    </span>
                    <p className="leading-relaxed text-xs sm:text-sm text-[#3b2b1d] italic">
                      "{world.worldLore}"
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Level Nodes Path */}
            <div className="relative flex flex-col items-center gap-6 sm:gap-8 py-2">
              {world.levels.map((level, levelIdx) => {
                const unlocked = isLevelUnlocked(worldIdx, levelIdx);
                const completed = progress.completedLevels.includes(level.id);
                const levelScore = progress.levelScores[level.id];
                const stars = levelScore?.stars || (completed ? 3 : 0);
                const isCurrent = unlocked && !completed;
                const IconComponent = ICON_MAP[level.iconName] || Terminal;

                const pathOffsets = ['sm:translate-x-0', 'sm:translate-x-8', 'sm:-translate-x-8', 'sm:translate-x-4', 'sm:translate-x-0'];
                const offsetClass = pathOffsets[levelIdx % pathOffsets.length];

                return (
                  <div 
                    key={level.id}
                    className={`relative flex flex-col items-center transition-transform duration-200 ${offsetClass}`}
                  >
                    {/* Connecting ink path to next node */}
                    {levelIdx < world.levels.length - 1 && (
                      <div className="absolute top-16 w-0.5 h-10 -z-0 bg-[#c8b79b] border-l border-dashed border-[#8c6b47]" />
                    )}

                    {/* Level Button Node */}
                    <button
                      id={`level-btn-${level.id}`}
                      disabled={!unlocked}
                      onClick={() => {
                        sound.playClick();
                        onSelectLevel(level);
                      }}
                      className={`group relative flex items-center gap-4 p-3 sm:px-5 sm:py-3.5 rounded-2xl border-2 transition-all duration-300 ${
                        completed
                          ? 'bg-[#fcfaf5] hover:bg-[#f6efe1] border-emerald-700/60 hover:border-emerald-700 shadow-md text-[#261d15] cursor-pointer'
                          : isCurrent
                          ? 'bg-[#fffcf5] border-[#b45309] shadow-lg ring-2 ring-[#b45309]/30 hover:scale-105 cursor-pointer text-[#261d15]'
                          : 'bg-[#ece3d4]/70 border-[#d8c8b0] opacity-50 cursor-not-allowed text-stone-500'
                      }`}
                    >
                      {/* Active level pulsing subtle ring */}
                      {isCurrent && (
                        <span className="absolute -inset-1 rounded-2xl bg-[#b45309]/15 animate-ping pointer-events-none" />
                      )}

                      {/* Icon Circle */}
                      <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-all ${
                        completed
                          ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-600/50'
                          : isCurrent
                          ? 'bg-[#b45309] text-amber-100 shadow-md border-2 border-[#78350f]'
                          : 'bg-[#dfd3c1] text-stone-500 border border-[#c8b79b]'
                      }`}>
                        {level.isBoss ? (
                          <Crown className={`w-6 h-6 ${isCurrent ? 'text-amber-200' : completed ? 'text-amber-700' : 'text-stone-500'}`} />
                        ) : (
                          <IconComponent className="w-5 h-5" />
                        )}

                        {/* Status badge */}
                        {completed && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-700 text-amber-100 flex items-center justify-center border-2 border-[#fcfaf5] shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                        {!unlocked && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-stone-600 text-stone-200 flex items-center justify-center border-2 border-[#ece3d4]">
                            <Lock className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>

                      {/* Level Text Details */}
                      <div className="text-left max-w-xs sm:max-w-sm">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-mono font-semibold ${isCurrent ? 'text-[#b45309]' : 'text-stone-600'}`}>
                            Misión {world.number}.{levelIdx + 1}
                          </span>
                          {level.isBoss && (
                            <span className="text-[10px] uppercase font-rpg-title font-bold tracking-wider px-2 py-0.5 rounded bg-amber-200/80 text-amber-950 border border-amber-500/50">
                              Encuentro de Jefe
                            </span>
                          )}
                          {isCurrent && (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-400">
                              <Play className="w-2.5 h-2.5 fill-amber-900" />
                              ¡Tu turno!
                            </span>
                          )}
                        </div>
                        
                        <h3 className={`text-sm sm:text-base font-bold font-rpg-title ${unlocked ? 'text-[#2b170c] group-hover:text-[#b45309] transition-colors' : 'text-stone-500'}`}>
                          {level.title}
                        </h3>
                        <p className="text-xs text-[#574838] font-serif line-clamp-1">
                          {level.subtitle}
                        </p>
                        {level.rpgContext && unlocked && (
                          <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-[#854d0e]">
                            <span className="truncate max-w-[200px]">🛡️ {level.rpgContext.partyRole}</span>
                          </div>
                        )}
                      </div>

                      {/* Stars indicator if completed */}
                      {completed && (
                        <div className="hidden sm:flex items-center gap-0.5 ml-2">
                          {[1, 2, 3].map((starIdx) => (
                            <Star 
                              key={starIdx}
                              className={`w-3.5 h-3.5 ${
                                starIdx <= stars
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-stone-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}

                      {/* Play arrow if current */}
                      {isCurrent && (
                        <div className="ml-2 hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-[#b45309] text-amber-100 group-hover:bg-[#92400e] transition-colors shadow-sm">
                          <Play className="w-4 h-4 fill-current" />
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};
