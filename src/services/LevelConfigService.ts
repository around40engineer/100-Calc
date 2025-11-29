import type { DifficultyLevel, LevelConfig } from '../types';
import { OperationType } from '../types';

/**
 * LevelConfigService
 * 各レベル（1-20）の設定を管理するサービス
 */
export class LevelConfigService {
  private static readonly levelConfigs: Record<DifficultyLevel, LevelConfig> = {
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
   * @param level - 取得するレベル（1-20）
   * @returns レベル設定
   */
  static getLevelConfig(level: DifficultyLevel): LevelConfig {
    const config = this.levelConfigs[level];
    if (!config) {
      // デフォルト設定（レベル1）を返す
      console.warn(`Level ${level} not found, returning default config`);
      return this.levelConfigs[1];
    }
    return config;
  }

  /**
   * すべてのレベル設定を取得
   * @returns すべてのレベル設定の配列
   */
  static getAllLevelConfigs(): LevelConfig[] {
    return Object.values(this.levelConfigs);
  }

  /**
   * レベル範囲の設定を取得
   * @param startLevel - 開始レベル
   * @param endLevel - 終了レベル
   * @returns 指定範囲のレベル設定の配列
   */
  static getLevelConfigRange(startLevel: DifficultyLevel, endLevel: DifficultyLevel): LevelConfig[] {
    const configs: LevelConfig[] = [];
    for (let level = startLevel; level <= endLevel; level++) {
      configs.push(this.getLevelConfig(level as DifficultyLevel));
    }
    return configs;
  }
}
