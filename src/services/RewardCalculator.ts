import { Difficulty, RewardType, type Pokemon, type Reward, type DifficultyLevel } from '../types';
import { LevelConfigService } from './LevelConfigService';

export interface RewardCalculationParams {
  difficulty?: Difficulty;
  level?: DifficultyLevel;
  isFirstClear: boolean;
  isNewRecord: boolean;
  mistakes: number;
  completionTime: number;
  pokemon: Pokemon;
}

export class RewardCalculator {
  // レベル15以上でレア度を上げる
  private static readonly RARE_BOOST_LEVEL = 15;

  /**
   * 指定されたレベルでレア度ブーストが適用されるかを判定
   * @param level - 判定するレベル
   * @returns レア度ブーストが適用される場合true
   */
  static shouldApplyRarityBoost(level?: DifficultyLevel): boolean {
    return level !== undefined && level >= this.RARE_BOOST_LEVEL;
  }
  
  private static readonly REWARD_POINTS = {
    [Difficulty.EASY]: {
      [RewardType.FIRST_CLEAR]: 100,
      [RewardType.NEW_RECORD]: 50,
      [RewardType.NO_MISTAKES]: 30,
      [RewardType.COMPLETION]: 20
    },
    [Difficulty.NORMAL]: {
      [RewardType.FIRST_CLEAR]: 200,
      [RewardType.NEW_RECORD]: 100,
      [RewardType.NO_MISTAKES]: 60,
      [RewardType.COMPLETION]: 40
    },
    [Difficulty.HARD]: {
      [RewardType.FIRST_CLEAR]: 300,
      [RewardType.NEW_RECORD]: 150,
      [RewardType.NO_MISTAKES]: 90,
      [RewardType.COMPLETION]: 60
    }
  };

  static calculate(params: RewardCalculationParams): Reward[] {
    const rewards: Reward[] = [];
    
    // レベルベースまたは難易度ベースのポイント設定を取得
    let pointConfig: typeof this.REWARD_POINTS[Difficulty];
    let multiplier = 1.0;
    
    if (params.level !== undefined) {
      // 新しいレベルシステム: レベル設定から倍率を取得
      const levelConfig = LevelConfigService.getLevelConfig(params.level);
      multiplier = levelConfig.pointsMultiplier;
      
      // ベースポイントは NORMAL を使用
      pointConfig = this.REWARD_POINTS[Difficulty.NORMAL];
    } else if (params.difficulty !== undefined) {
      // 既存の難易度システム
      pointConfig = this.REWARD_POINTS[params.difficulty];
    } else {
      // デフォルトは NORMAL
      pointConfig = this.REWARD_POINTS[Difficulty.NORMAL];
    }

    // 完了報酬（必ず付与）
    rewards.push({
      type: RewardType.COMPLETION,
      points: Math.round(pointConfig[RewardType.COMPLETION] * multiplier),
      pokemon: params.pokemon
    });

    // 初クリア報酬
    if (params.isFirstClear) {
      rewards.push({
        type: RewardType.FIRST_CLEAR,
        points: Math.round(pointConfig[RewardType.FIRST_CLEAR] * multiplier)
      });
    }

    // 新記録報酬
    if (params.isNewRecord) {
      rewards.push({
        type: RewardType.NEW_RECORD,
        points: Math.round(pointConfig[RewardType.NEW_RECORD] * multiplier)
      });
    }

    // ノーミス報酬
    if (params.mistakes === 0) {
      rewards.push({
        type: RewardType.NO_MISTAKES,
        points: Math.round(pointConfig[RewardType.NO_MISTAKES] * multiplier)
      });
    }

    return rewards;
  }
}
