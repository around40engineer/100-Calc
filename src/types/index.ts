// 難易度レベル（既存）
export enum Difficulty {
  EASY = 'easy',
  NORMAL = 'normal',
  HARD = 'hard'
}

// 新しいレベルシステム（1-20）
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 
                               11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20;

// レベル設定
export interface LevelConfig {
  level: DifficultyLevel;
  name: string;
  timeLimit: number; // 秒
  operationTypes: OperationType[];
  numberRange: {
    min: number;
    max: number;
  };
  pointsMultiplier: number;
}

// 演算タイプ
export enum OperationType {
  ADDITION = 'addition',
  SUBTRACTION = 'subtraction',
  MULTIPLICATION = 'multiplication'
}

// レア度
export enum Rarity {
  COMMON = 'common',
  RARE = 'rare',
  LEGENDARY = 'legendary'
}

// 報酬タイプ
export enum RewardType {
  FIRST_CLEAR = 'first_clear',
  NEW_RECORD = 'new_record',
  NO_MISTAKES = 'no_mistakes',
  COMPLETION = 'completion'
}

// PokeAPI レスポンス型
export interface PokeApiPokemon {
  id: number;
  name: string;
  sprites: {
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
}

// ポケモンデータ
export interface Pokemon {
  id: number;              // PokeAPI の pokemon ID
  name: string;            // ポケモンの名前（英語）
  japaneseName: string;    // ポケモンの名前（日本語）
  imageUrl: string;        // PokeAPI から取得した画像URL
  rarity: Rarity;          // アプリ側で判定したレア度
}

// 計算問題
export interface Problem {
  id: string;
  operand1: number;
  operand2: number;
  operation: OperationType;
  answer: number;
}

// マスセルの状態
export interface CellState {
  problem: Problem;
  userAnswer: number | null;
  isCorrect: boolean | null;
  isRevealed: boolean;
}

// チャレンジセッション
export interface ChallengeSession {
  id: string;
  difficulty: Difficulty | DifficultyLevel;
  pokemon: Pokemon;
  cells: CellState[][];  // 10x10 grid
  startTime: number;
  timeLimit: number;  // seconds
  mistakes: number;
  isCompleted: boolean;
}

// ユーザー統計（既存のDifficultyベース）
export interface UserStats {
  [key: string]: {  // difficulty level
    bestTime: number | null;
    totalPlays: number;
    firstClearAchieved: boolean;
  };
}

// レベル統計（新しいレベルシステム用）
export interface LevelStats {
  level: DifficultyLevel;
  bestTime: number | null;
  totalPlays: number;
  cleared: boolean;
  stars: number; // 0-3 (パフォーマンスに基づく)
}

// ユーザーデータ
export interface UserData {
  points: number;
  ownedPokemon: number[];  // PokeAPI の pokemon IDs
  stats: UserStats;
  levelStats?: Partial<Record<DifficultyLevel, LevelStats>>; // 新しいレベルシステム用（オプショナル）
  highestUnlockedLevel?: DifficultyLevel; // 最高アンロックレベル（オプショナル）
}

// 報酬
export interface Reward {
  type: RewardType;
  points: number;
  pokemon?: Pokemon;
}
