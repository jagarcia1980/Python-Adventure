export type MiniGameType = 
  | 'rover' 
  | 'cannon' 
  | 'gatekeeper' 
  | 'miner' 
  | 'inventory' 
  | 'boss_battle'
  | 'battle';

export interface TutorialSection {
  conceptTitle: string;
  conceptSummary: string;
  syntaxSnippet: string;
  codeExample: string;
  explanation: string;
  keyPoints: string[];
}

export interface RoverCellObstacle {
  x: number;
  y: number;
  type: 'crater' | 'rock';
}

export interface RoverCrystal {
  id: string;
  x: number;
  y: number;
  collected?: boolean;
}

export interface AsteroidTarget {
  id: string;
  distance: number;
  hp: number;
  name: string;
}

export interface SecurityVisitor {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isAlly: boolean;
  clearanceLevel: number;
  hasVirus: boolean;
  hasContraband: boolean;
  expectedAction: 'allow' | 'block' | 'alarm';
}

export interface MineralVein {
  depth: number;
  crystals: number;
  isHazard?: boolean;
}

export interface RpgChest {
  id: string;
  requiredKey: string;
  reward: string;
  isOpen?: boolean;
}

export interface MiniGameConfig {
  gameType: MiniGameType;
  instructions: string;
  objectives: string[];
  starterCode: string;
  solutionCode: string;
  hints: string[];
  
  // Rover config
  gridWidth?: number;
  gridHeight?: number;
  roverStart?: { x: number; y: number; dir: 'N' | 'E' | 'S' | 'W' };
  crystals?: RoverCrystal[];
  obstacles?: RoverCellObstacle[];
  baseStation?: { x: number; y: number };
  maxSteps?: number;
  
  // Cannon config
  asteroids?: AsteroidTarget[];
  requiredFormulaHint?: string;
  
  // Gatekeeper config
  visitors?: SecurityVisitor[];

  // Miner config
  veins?: MineralVein[];
  initialBattery?: number;
  targetCrystals?: number;

  // Inventory config
  initialInventory?: string[];
  availableChests?: RpgChest[];
  targetInventory?: string[];
  disallowedItems?: string[];

  // Boss battle config
  bossName?: string;
  bossHp?: number;
  bossShield?: number;
  bossAvatar?: string;
  playerHp?: number;
  roundsCount?: number;

  // Tactical battle config
  enemyName?: string;
  enemyHp?: number;
}

export interface RpgContext {
  dmNarrative: string;
  partyRole: string;
  tacticalGoal: string;
  sceneImage?: string;
  diceCheck?: string;
}

export interface Level {
  id: string;
  worldId: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  gameType: MiniGameType;
  tutorial: TutorialSection;
  gameConfig: MiniGameConfig;
  xpReward: number;
  requiredXp?: number;
  isBoss?: boolean;
  rpgContext?: RpgContext;
}

export interface World {
  id: string;
  number: number;
  actTitle?: string;
  title: string;
  subtitle: string;
  gameTheme: string;
  themeColor: string;
  bgGradient: string;
  levels: Level[];
  worldImage?: string;
  worldLore?: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'progress' | 'mastery' | 'streak' | 'special';
  requirementText: string;
  unlockedAt?: string;
}

export interface UserStats {
  totalChallengesSolved: number;
  perfectLevels: number;
  codeRuns: number;
  streak: number;
  timeSpentMinutes: number;
}

export interface UserProgress {
  userName: string;
  xp: number;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  activeDates: string[];
  completedLevels: string[];
  levelScores: Record<string, { stars: number; bestScore: number; completedAt: string }>;
  unlockedBadges: string[];
  stats: UserStats;
  soundEnabled: boolean;
  lastSavedAt: string;
}

