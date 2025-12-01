import type { DifficultyLevel, LevelConfig } from '../types';
import { OperationType } from '../types';

/**
 * LevelConfigService
 * 各レベル（1-100）の設定を管理するサービス
 */
export class LevelConfigService {
  private static readonly MAX_LEVEL = 100;
  private static levelConfigsCache: Map<number, LevelConfig> = new Map();

  /**
   * レベル設定を動的に生成
   */
  private static generateLevelConfig(level: number): LevelConfig {
    // キャッシュチェック
    if (this.levelConfigsCache.has(level)) {
      return this.levelConfigsCache.get(level)!;
    }

    let config: LevelConfig;

    // レベル1-10: 1桁の足し算
    if (level === 1) {
      config = {
        level: level as DifficultyLevel,
        name: `レベル1: 1桁の足し算（くり上がりなし）`,
        timeLimit: 600,
        operationTypes: [OperationType.ADDITION],
        numberRange: { min: 0, max: 5 },
        pointsMultiplier: 1.0,
        allowCarryOver: false,
      };
    } else if (level === 2) {
      config = {
        level: level as DifficultyLevel,
        name: `レベル2: 1桁の足し算（くり上がりあり）`,
        timeLimit: 600,
        operationTypes: [OperationType.ADDITION],
        numberRange: { min: 0, max: 9 },
        pointsMultiplier: 1.1,
        allowCarryOver: true,
      };
    } else if (level === 3) {
      config = {
        level: level as DifficultyLevel,
        name: `レベル3: 1桁と2桁の足し算（くり上がりなし）`,
        timeLimit: 600,
        operationTypes: [OperationType.ADDITION],
        numberRange: { min: 0, max: 19 },
        pointsMultiplier: 1.2,
        allowCarryOver: false,
        digitConstraint: { operand1Digits: 2, operand2Digits: 1 },
      };
    } else if (level <= 10) {
      config = {
        level: level as DifficultyLevel,
        name: `レベル${level}: ${this.getLevelName(level)}`,
        timeLimit: Math.max(480, 600 - level * 12),
        operationTypes: [OperationType.ADDITION],
        numberRange: { min: 0, max: 9 + level },
        pointsMultiplier: 1.0 + (level - 1) * 0.1,
        allowCarryOver: true,
      };
    }
    // レベル21-50: 2桁の計算
    else if (level <= 50) {
      const operations = level <= 30 ? [OperationType.ADDITION] :
                        level <= 40 ? [OperationType.SUBTRACTION] :
                        [OperationType.ADDITION, OperationType.SUBTRACTION, OperationType.MULTIPLICATION];
      
      config = {
        level: level as DifficultyLevel,
        name: `レベル${level}: ${this.getLevelName(level)}`,
        timeLimit: Math.max(240, 480 - (level - 20) * 8),
        operationTypes: operations,
        numberRange: { min: 10, max: Math.min(99, 20 + (level - 20) * 2) },
        pointsMultiplier: 2.0 + (level - 21) * 0.1,
      };
    }
    // レベル51-80: 3桁の計算
    else if (level <= 80) {
      const operations = level <= 60 ? [OperationType.ADDITION] :
                        level <= 70 ? [OperationType.SUBTRACTION] :
                        [OperationType.ADDITION, OperationType.SUBTRACTION, OperationType.MULTIPLICATION];
      
      config = {
        level: level as DifficultyLevel,
        name: `レベル${level}: ${this.getLevelName(level)}`,
        timeLimit: Math.max(180, 360 - (level - 50) * 6),
        operationTypes: operations,
        numberRange: { min: 100, max: Math.min(999, 200 + (level - 50) * 20) },
        pointsMultiplier: 4.0 + (level - 51) * 0.15,
      };
    }
    // レベル81-100: 究極の挑戦
    else {
      config = {
        level: level as DifficultyLevel,
        name: `レベル${level}: ${this.getLevelName(level)}`,
        timeLimit: Math.max(120, 300 - (level - 80) * 9),
        operationTypes: [OperationType.ADDITION, OperationType.SUBTRACTION, OperationType.MULTIPLICATION],
        numberRange: { min: 100, max: 999 },
        pointsMultiplier: 8.0 + (level - 81) * 0.2,
      };
    }

    this.levelConfigsCache.set(level, config);
    return config;
  }

  /**
   * レベル名を取得
   */
  private static getLevelName(level: number): string {
    if (level <= 5) return '足し算入門';
    if (level <= 10) return '基礎計算';
    if (level <= 20) return '1桁マスター';
    if (level <= 30) return '2桁入門';
    if (level <= 40) return '2桁中級';
    if (level <= 50) return '2桁上級';
    if (level <= 60) return '3桁入門';
    if (level <= 70) return '3桁中級';
    if (level <= 80) return '3桁上級';
    if (level <= 90) return '究極への道';
    return '伝説の挑戦';
  }

  private static readonly levelConfigs: Record<number, LevelConfig> = {
    // レベル1-5: 1桁の足し算
    1: {
      level: 1,
      name: 'レベル1: 足し算入門',
      timeLimit: 600, // 10分
      operationTypes: [OperationType.ADDITION],
      numberRange: { min: 0, max: 5 },
      pointsMultiplier: 1.0,
    },
    2: {
      level: 2,
      name: 'レベル2: 足し算初級',
      timeLimit: 600,
      operationTypes: [OperationType.ADDITION],
      numberRange: { min: 0, max: 7 },
      pointsMultiplier: 1.0,
    },
    3: {
      level: 3,
      name: 'レベル3: 足し算中級',
      timeLimit: 600,
      operationTypes: [OperationType.ADDITION],
      numberRange: { min: 0, max: 9 },
      pointsMultiplier: 1.0,
    },
    4: {
      level: 4,
      name: 'レベル4: 足し算上級',
      timeLimit: 540, // 9分
      operationTypes: [OperationType.ADDITION],
      numberRange: { min: 0, max: 9 },
      pointsMultiplier: 1.0,
    },
    5: {
      level: 5,
      name: 'レベル5: 足し算マスター',
      timeLimit: 540,
      operationTypes: [OperationType.ADDITION],
      numberRange: { min: 0, max: 9 },
      pointsMultiplier: 1.0,
    },

    // レベル6-10: 1桁の引き算・掛け算
    6: {
      level: 6,
      name: 'レベル6: 引き算入門',
      timeLimit: 480, // 8分
      operationTypes: [OperationType.SUBTRACTION],
      numberRange: { min: 0, max: 9 },
      pointsMultiplier: 1.5,
    },
    7: {
      level: 7,
      name: 'レベル7: 引き算初級',
      timeLimit: 480,
      operationTypes: [OperationType.SUBTRACTION],
      numberRange: { min: 0, max: 9 },
      pointsMultiplier: 1.5,
    },
    8: {
      level: 8,
      name: 'レベル8: 掛け算入門',
      timeLimit: 480,
      operationTypes: [OperationType.MULTIPLICATION],
      numberRange: { min: 0, max: 5 },
      pointsMultiplier: 1.5,
    },
    9: {
      level: 9,
      name: 'レベル9: 掛け算初級',
      timeLimit: 480,
      operationTypes: [OperationType.MULTIPLICATION],
      numberRange: { min: 0, max: 7 },
      pointsMultiplier: 1.5,
    },
    10: {
      level: 10,
      name: 'レベル10: 四則演算初級',
      timeLimit: 480,
      operationTypes: [OperationType.ADDITION, OperationType.SUBTRACTION, OperationType.MULTIPLICATION],
      numberRange: { min: 0, max: 9 },
      pointsMultiplier: 1.5,
    },

    // レベル11-15: 2桁の足し算・引き算
    11: {
      level: 11,
      name: 'レベル11: 2桁足し算入門',
      timeLimit: 420, // 7分
      operationTypes: [OperationType.ADDITION],
      numberRange: { min: 10, max: 50 },
      pointsMultiplier: 2.0,
    },
    12: {
      level: 12,
      name: 'レベル12: 2桁足し算初級',
      timeLimit: 420,
      operationTypes: [OperationType.ADDITION],
      numberRange: { min: 10, max: 99 },
      pointsMultiplier: 2.0,
    },
    13: {
      level: 13,
      name: 'レベル13: 2桁引き算入門',
      timeLimit: 420,
      operationTypes: [OperationType.SUBTRACTION],
      numberRange: { min: 10, max: 50 },
      pointsMultiplier: 2.0,
    },
    14: {
      level: 14,
      name: 'レベル14: 2桁引き算初級',
      timeLimit: 420,
      operationTypes: [OperationType.SUBTRACTION],
      numberRange: { min: 10, max: 99 },
      pointsMultiplier: 2.0,
    },
    15: {
      level: 15,
      name: 'レベル15: 2桁四則演算',
      timeLimit: 420,
      operationTypes: [OperationType.ADDITION, OperationType.SUBTRACTION],
      numberRange: { min: 10, max: 99 },
      pointsMultiplier: 2.0,
    },

    // レベル16-20: 2桁の掛け算
    16: {
      level: 16,
      name: 'レベル16: 2桁掛け算入門',
      timeLimit: 360, // 6分
      operationTypes: [OperationType.MULTIPLICATION],
      numberRange: { min: 10, max: 20 },
      pointsMultiplier: 3.0,
    },
    17: {
      level: 17,
      name: 'レベル17: 2桁掛け算初級',
      timeLimit: 360,
      operationTypes: [OperationType.MULTIPLICATION],
      numberRange: { min: 10, max: 30 },
      pointsMultiplier: 3.0,
    },
    18: {
      level: 18,
      name: 'レベル18: 2桁掛け算中級',
      timeLimit: 360,
      operationTypes: [OperationType.MULTIPLICATION],
      numberRange: { min: 10, max: 50 },
      pointsMultiplier: 3.0,
    },
    19: {
      level: 19,
      name: 'レベル19: 2桁掛け算上級',
      timeLimit: 360,
      operationTypes: [OperationType.MULTIPLICATION],
      numberRange: { min: 10, max: 99 },
      pointsMultiplier: 3.0,
    },
    20: {
      level: 20,
      name: 'レベル20: 究極の挑戦',
      timeLimit: 300, // 5分
      operationTypes: [OperationType.ADDITION, OperationType.SUBTRACTION, OperationType.MULTIPLICATION],
      numberRange: { min: 10, max: 99 },
      pointsMultiplier: 3.0,
    },
  };

  /**
   * 指定されたレベルの設定を取得
   * @param level - 取得するレベル（1-100）
   * @returns レベル設定
   */
  static getLevelConfig(level: DifficultyLevel): LevelConfig {
    const levelNum = level as number;
    if (levelNum < 1 || levelNum > this.MAX_LEVEL) {
      console.warn(`Level ${level} out of range, returning level 1 config`);
      return this.generateLevelConfig(1);
    }
    return this.generateLevelConfig(levelNum);
  }

  /**
   * すべてのレベル設定を取得
   * @returns すべてのレベル設定の配列
   */
  static getAllLevelConfigs(): LevelConfig[] {
    const configs: LevelConfig[] = [];
    for (let level = 1; level <= this.MAX_LEVEL; level++) {
      configs.push(this.generateLevelConfig(level));
    }
    return configs;
  }

  /**
   * レベル範囲の設定を取得
   * @param startLevel - 開始レベル
   * @param endLevel - 終了レベル
   * @returns 指定範囲のレベル設定の配列
   */
  static getLevelConfigRange(startLevel: DifficultyLevel, endLevel: DifficultyLevel): LevelConfig[] {
    const configs: LevelConfig[] = [];
    const start = startLevel as number;
    const end = endLevel as number;
    for (let level = start; level <= end; level++) {
      configs.push(this.generateLevelConfig(level));
    }
    return configs;
  }

  /**
   * 最大レベルを取得
   */
  static getMaxLevel(): number {
    return this.MAX_LEVEL;
  }
}
