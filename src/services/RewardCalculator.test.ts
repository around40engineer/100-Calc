import { describe, it, expect } from 'vitest';
import { RewardCalculator } from './RewardCalculator.js';
import { Difficulty, RewardType, Rarity, type Pokemon, type Reward } from '../types/index.js';

describe('RewardCalculator', () => {
  // モックポケモンデータ
  const mockPokemon: Pokemon = {
    id: 25,
    name: 'pikachu',
    japaneseName: 'ピカチュウ',
    imageUrl: 'https://example.com/pikachu.png',
    rarity: Rarity.COMMON
  };

  describe('完了報酬', () => {
    it('Given チャレンジを完了した When 報酬を計算する Then 完了報酬が必ず含まれる', () => {
      // Given
      const params = {
        difficulty: Difficulty.EASY,
        isFirstClear: false,
        isNewRecord: false,
        mistakes: 5,
        completionTime: 300,
        pokemon: mockPokemon
      };

      // When
      const rewards = RewardCalculator.calculate(params);

      // Then
      const completionReward = rewards.find((r: Reward) => r.type === RewardType.COMPLETION);
      expect(completionReward).toBeDefined();
      expect(completionReward?.points).toBe(20);
      expect(completionReward?.pokemon).toEqual(mockPokemon);
    });

    it('Given 簡単モードを完了した When 報酬を計算する Then 完了報酬は20ポイントである', () => {
      // Given
      const params = {
        difficulty: Difficulty.EASY,
        isFirstClear: false,
        isNewRecord: false,
        mistakes: 0,
        completionTime: 300,
        pokemon: mockPokemon
      };

      // When
      const rewards = RewardCalculator.calculate(params);

      // Then
      const completionReward = rewards.find((r: Reward) => r.type === RewardType.COMPLETION);
      expect(completionReward?.points).toBe(20);
    });

    it('Given 普通モードを完了した When 報酬を計算する Then 完了報酬は40ポイントである', () => {
      // Given
      const params = {
        difficulty: Difficulty.NORMAL,
        isFirstClear: false,
        isNewRecord: false,
        mistakes: 0,
        completionTime: 300,
        pokemon: mockPokemon
      };

      // When
      const rewards = RewardCalculator.calculate(params);

      // Then
      const completionReward = rewards.find((r: Reward) => r.type === RewardType.COMPLETION);
      expect(completionReward?.points).toBe(40);
    });

    it('Given 難しいモードを完了した When 報酬を計算する Then 完了報酬は60ポイントである', () => {
      // Given
      const params = {
        difficulty: Difficulty.HARD,
        isFirstClear: false,
        isNewRecord: false,
        mistakes: 0,
        completionTime: 300,
        pokemon: mockPokemon
      };

      // When
      const rewards = RewardCalculator.calculate(params);

      // Then
      const completionReward = rewards.find((r: Reward) => r.type === RewardType.COMPLETION);
      expect(completionReward?.points).toBe(60);
    });
  });

  describe('初クリア報酬', () => {
    it('Given 初めてクリアした When 報酬を計算する Then 初クリア報酬が含まれる', () => {
      // Given
      const params = {
        difficulty: Difficulty.EASY,
        isFirstClear: true,
        isNewRecord: false,
        mistakes: 0,
        completionTime: 300,
        pokemon: mockPokemon
      };

      // When
      const rewards = RewardCalculator.calculate(params);

      // Then
      const firstClearReward = rewards.find((r: Reward) => r.type === RewardType.FIRST_CLEAR);
      expect(firstClearReward).toBeDefined();
      expect(firstClearReward?.points).toBe(100);
    });

    it('Given 初クリアではない When 報酬を計算する Then 初クリア報酬は含まれない', () => {
      // Given
      const params = {
        difficulty: Difficulty.EASY,
        isFirstClear: false,
        isNewRecord: false,
        mistakes: 0,
        completionTime: 300,
        pokemon: mockPokemon
      };

      // When
      const rewards = RewardCalculator.calculate(params);

      // Then
      const firstClearReward = rewards.find((r: Reward) => r.type === RewardType.FIRST_CLEAR);
      expect(firstClearReward).toBeUndefined();
    });

    it('Given 簡単モードで初クリア When 報酬を計算する Then 初クリア報酬は100ポイントである', () => {
      // Given
      const params = {
        difficulty: Difficulty.EASY,
        isFirstClear: true,
        isNewRecord: false,
        mistakes: 0,
        completionTime: 300,
        pokemon: mockPokemon
      };

      // When
      const rewards = RewardCalculator.calculate(params);

      // Then
      const firstClearReward = rewards.find((r: Reward) => r.type === RewardType.FIRST_CLEAR);
      expect(firstClearReward?.points).toBe(100);
    });

    it('Given 普通モードで初クリア When 報酬を計算する Then 初クリア報酬は200ポイントである', () => {
      // Given
      const params = {
        difficulty: Difficulty.NORMAL,
        isFirstClear: true,
        isNewRecord: false,
        mistakes: 0,
        completionTime: 300,
        pokemon: mockPokemon
      };

      // When
      const rewards = RewardCalculator.calculate(params);

      // Then
      const firstClearReward = rewards.find((r: Reward) => r.type === RewardType.FIRST_CLEAR);
      expect(firstClearReward?.points).toBe(200);
    });

    it('Given 難しいモードで初クリア When 報酬を計算する Then 初クリア報酬は300ポイントである', () => {
      // Given
      const params = {
        difficulty: Difficulty.HARD,
        isFirstClear: true,
        isNewRecord: false,
        mistakes: 0,
        completionTime: 300,
        pokemon: mockPokemon
      };

      // When
      const rewards = RewardCalculator.calculate(params);

      // Then
      const firstClearReward = rewards.find((r: Reward) => r.type === RewardType.FIRST_CLEAR);
      expect(firstClearReward?.points).toBe(300);
    });
  });

  describe('新記録報酬', () => {
    it('Given 新記録を達成した When 報酬を計算する Then 新記録報酬が含まれる', () => {
      // Given
      const params = {
        difficulty: Difficulty.NORMAL,
        isFirstClear: false,
        isNewRecord: true,
        mistakes: 0,
        completionTime: 300,
        pokemon: mockPokemon
      };

      // When
      const rewards = RewardCalculator.calculate(params);

      // Then
      const newRecordReward = rewards.find((r: Reward) => r.type === RewardType.NEW_RECORD);
      expect(newRecordReward).toBeDefined();
      expect(newRecordReward?.points).toBe(100);
    });

    it('Given 新記録ではない When 報酬を計算する Then 新記録報酬は含まれない', () => {
      // Given
      const params = {
        difficulty: Difficulty.NORMAL,
        isFirstClear: false,
        isNewRecord: false,
        mistakes: 0,
        completionTime: 300,
        pokemon: mockPokemon
      };

      // When
      const rewards = RewardCalculator.calculate(params);

      // Then
      const newRecordReward = rewards.find((r: Reward) => r.type === RewardType.NEW_RECORD);
      expect(newRecordReward).toBeUndefined();
    });

    it('Given 簡単モードで新記録 When 報酬を計算する Then 新記録報酬は50ポイントである', () => {
      // Given
      const params = {
        difficulty: Difficulty.EASY,
        isFirstClear: false,
        isNewRecord: true,
        mistakes: 0,
        completionTime: 300,
        pokemon: mockPokemon
      };

      // When
      const rewards = RewardCalculator.calculate(params);

      // Then
      const newRecordReward = rewards.find((r: Reward) => r.type === RewardType.NEW_RECORD);
      expect(newRecordReward?.points).toBe(50);
    });

    it('Given 普通モードで新記録 When 報酬を計算する Then 新記録報酬は100ポイントである', () => {
      // Given
      const params = {
        difficulty: Difficulty.NORMAL,
        isFirstClear: false,
        isNewRecord: true,
        mistakes: 0,
        completionTime: 300,
        pokemon: mockPokemon
      };

      // When
      const rewards = RewardCalculator.calculate(params);

      // Then
      const newRecordReward = rewards.find((r: Reward) => r.type === RewardType.NEW_RECORD);
      expect(newRecordReward?.points).toBe(100);
    });

    it('Given 難しいモードで新記録 When 報酬を計算する Then 新記録報酬は150ポイントである', () => {
      // Given
      const params = {
        difficulty: Difficulty.HARD,
        isFirstClear: false,
        isNewRecord: true,
        mistakes: 0,
        completionTime: 300,
        pokemon: mockPokemon
      };

      // When
      const rewards = RewardCalculator.calculate(params);

      // Then
      const newRecordReward = rewards.find((r: Reward) => r.type === RewardType.NEW_RECORD);
      expect(newRecordReward?.points).toBe(150);
    });
  });

  describe('ノーミス報酬', () => {
    it('Given ノーミスでクリア When 報酬を計算する Then ノーミス報酬が含まれる', () => {
      // Given
      const params = {
        difficulty: Difficulty.NORMAL,
        isFirstClear: false,
        isNewRecord: false,
        mistakes: 0,
        completionTime: 300,
        pokemon: mockPokemon
      };

      // When
      const rewards = RewardCalculator.calculate(params);

      // Then
      const noMistakesReward = rewards.find((r: Reward) => r.type === RewardType.NO_MISTAKES);
      expect(noMistakesReward).toBeDefined();
      expect(noMistakesReward?.points).toBe(60);
    });

    it('Given ミスがある When 報酬を計算する Then ノーミス報酬は含まれない', () => {
      // Given
      const params = {
        difficulty: Difficulty.NORMAL,
        isFirstClear: false,
        isNewRecord: false,
        mistakes: 3,
        completionTime: 300,
        pokemon: mockPokemon
      };

      // When
      const rewards = RewardCalculator.calculate(params);

      // Then
      const noMistakesReward = rewards.find((r: Reward) => r.type === RewardType.NO_MISTAKES);
      expect(noMistakesReward).toBeUndefined();
    });

    it('Given 簡単モードでノーミス When 報酬を計算する Then ノーミス報酬は30ポイントである', () => {
      // Given
      const params = {
        difficulty: Difficulty.EASY,
        isFirstClear: false,
        isNewRecord: false,
        mistakes: 0,
        completionTime: 300,
        pokemon: mockPokemon
      };

      // When
      const rewards = RewardCalculator.calculate(params);

      // Then
      const noMistakesReward = rewards.find((r: Reward) => r.type === RewardType.NO_MISTAKES);
      expect(noMistakesReward?.points).toBe(30);
    });

    it('Given 普通モードでノーミス When 報酬を計算する Then ノーミス報酬は60ポイントである', () => {
      // Given
      const params = {
        difficulty: Difficulty.NORMAL,
        isFirstClear: false,
        isNewRecord: false,
        mistakes: 0,
        completionTime: 300,
        pokemon: mockPokemon
      };

      // When
      const rewards = RewardCalculator.calculate(params);

      // Then
      const noMistakesReward = rewards.find((r: Reward) => r.type === RewardType.NO_MISTAKES);
      expect(noMistakesReward?.points).toBe(60);
    });

    it('Given 難しいモードでノーミス When 報酬を計算する Then ノーミス報酬は90ポイントである', () => {
      // Given
      const params = {
        difficulty: Difficulty.HARD,
        isFirstClear: false,
        isNewRecord: false,
        mistakes: 0,
        completionTime: 300,
        pokemon: mockPokemon
      };

      // When
      const rewards = RewardCalculator.calculate(params);

      // Then
      const noMistakesReward = rewards.find((r: Reward) => r.type === RewardType.NO_MISTAKES);
      expect(noMistakesReward?.points).toBe(90);
    });
  });

  describe('複数報酬の組み合わせ', () => {
    it('Given 初クリア、新記録、ノーミスを全て達成 When 報酬を計算する Then 全ての報酬が含まれる', () => {
      // Given
      const params = {
        difficulty: Difficulty.NORMAL,
        isFirstClear: true,
        isNewRecord: true,
        mistakes: 0,
        completionTime: 300,
        pokemon: mockPokemon
      };

      // When
      const rewards = RewardCalculator.calculate(params);

      // Then
      expect(rewards).toHaveLength(4); // 完了 + 初クリア + 新記録 + ノーミス
      expect(rewards.find((r: Reward) => r.type === RewardType.COMPLETION)).toBeDefined();
      expect(rewards.find((r: Reward) => r.type === RewardType.FIRST_CLEAR)).toBeDefined();
      expect(rewards.find((r: Reward) => r.type === RewardType.NEW_RECORD)).toBeDefined();
      expect(rewards.find((r: Reward) => r.type === RewardType.NO_MISTAKES)).toBeDefined();
    });

    it('Given 初クリアとノーミスを達成 When 報酬を計算する Then 完了、初クリア、ノーミス報酬が含まれる', () => {
      // Given
      const params = {
        difficulty: Difficulty.EASY,
        isFirstClear: true,
        isNewRecord: false,
        mistakes: 0,
        completionTime: 300,
        pokemon: mockPokemon
      };

      // When
      const rewards = RewardCalculator.calculate(params);

      // Then
      expect(rewards).toHaveLength(3);
      expect(rewards.find((r: Reward) => r.type === RewardType.COMPLETION)).toBeDefined();
      expect(rewards.find((r: Reward) => r.type === RewardType.FIRST_CLEAR)).toBeDefined();
      expect(rewards.find((r: Reward) => r.type === RewardType.NO_MISTAKES)).toBeDefined();
      expect(rewards.find((r: Reward) => r.type === RewardType.NEW_RECORD)).toBeUndefined();
    });

    it('Given 完了のみ When 報酬を計算する Then 完了報酬のみが含まれる', () => {
      // Given
      const params = {
        difficulty: Difficulty.HARD,
        isFirstClear: false,
        isNewRecord: false,
        mistakes: 10,
        completionTime: 300,
        pokemon: mockPokemon
      };

      // When
      const rewards = RewardCalculator.calculate(params);

      // Then
      expect(rewards).toHaveLength(1);
      expect(rewards[0].type).toBe(RewardType.COMPLETION);
    });
  });

  describe('レベルベースの報酬計算', () => {
    it('Given レベル1でクリア When 報酬を計算する Then 倍率1.0が適用される', () => {
      // Given
      const params = {
        level: 1 as const,
        isFirstClear: false,
        isNewRecord: false,
        mistakes: 0,
        completionTime: 300,
        pokemon: mockPokemon
      };

      // When
      const rewards = RewardCalculator.calculate(params);

      // Then
      const completionReward = rewards.find((r: Reward) => r.type === RewardType.COMPLETION);
      expect(completionReward?.points).toBe(40); // NORMAL base (40) * 1.0
    });

    it('Given レベル6でクリア When 報酬を計算する Then 倍率1.5が適用される', () => {
      // Given
      const params = {
        level: 6 as const,
        isFirstClear: false,
        isNewRecord: false,
        mistakes: 0,
        completionTime: 300,
        pokemon: mockPokemon
      };

      // When
      const rewards = RewardCalculator.calculate(params);

      // Then
      const completionReward = rewards.find((r: Reward) => r.type === RewardType.COMPLETION);
      expect(completionReward?.points).toBe(60); // NORMAL base (40) * 1.5
    });

    it('Given レベル11でクリア When 報酬を計算する Then 倍率2.0が適用される', () => {
      // Given
      const params = {
        level: 11 as const,
        isFirstClear: false,
        isNewRecord: false,
        mistakes: 0,
        completionTime: 300,
        pokemon: mockPokemon
      };

      // When
      const rewards = RewardCalculator.calculate(params);

      // Then
      const completionReward = rewards.find((r: Reward) => r.type === RewardType.COMPLETION);
      expect(completionReward?.points).toBe(80); // NORMAL base (40) * 2.0
    });

    it('Given レベル16でクリア When 報酬を計算する Then 倍率3.0が適用される', () => {
      // Given
      const params = {
        level: 16 as const,
        isFirstClear: false,
        isNewRecord: false,
        mistakes: 0,
        completionTime: 300,
        pokemon: mockPokemon
      };

      // When
      const rewards = RewardCalculator.calculate(params);

      // Then
      const completionReward = rewards.find((r: Reward) => r.type === RewardType.COMPLETION);
      expect(completionReward?.points).toBe(120); // NORMAL base (40) * 3.0
    });

    it('Given レベル20で全報酬達成 When 報酬を計算する Then 全報酬に倍率3.0が適用される', () => {
      // Given
      const params = {
        level: 20 as const,
        isFirstClear: true,
        isNewRecord: true,
        mistakes: 0,
        completionTime: 300,
        pokemon: mockPokemon
      };

      // When
      const rewards = RewardCalculator.calculate(params);
      const totalPoints = rewards.reduce((sum: number, reward: Reward) => sum + reward.points, 0);

      // Then
      // NORMAL base: 完了40 + 初クリア200 + 新記録100 + ノーミス60 = 400
      // 倍率3.0適用: 400 * 3.0 = 1200
      expect(totalPoints).toBe(1200);
    });
  });

  describe('レア度ブースト判定', () => {
    it('Given レベル14 When レア度ブースト判定 Then falseを返す', () => {
      // Given & When
      const result = RewardCalculator.shouldApplyRarityBoost(14);

      // Then
      expect(result).toBe(false);
    });

    it('Given レベル15 When レア度ブースト判定 Then trueを返す', () => {
      // Given & When
      const result = RewardCalculator.shouldApplyRarityBoost(15);

      // Then
      expect(result).toBe(true);
    });

    it('Given レベル20 When レア度ブースト判定 Then trueを返す', () => {
      // Given & When
      const result = RewardCalculator.shouldApplyRarityBoost(20);

      // Then
      expect(result).toBe(true);
    });

    it('Given レベル未指定 When レア度ブースト判定 Then falseを返す', () => {
      // Given & When
      const result = RewardCalculator.shouldApplyRarityBoost(undefined);

      // Then
      expect(result).toBe(false);
    });
  });

  describe('報酬の総ポイント計算', () => {
    it('Given 簡単モードで全報酬達成 When 報酬を計算する Then 総ポイントは200である', () => {
      // Given
      const params = {
        difficulty: Difficulty.EASY,
        isFirstClear: true,
        isNewRecord: true,
        mistakes: 0,
        completionTime: 300,
        pokemon: mockPokemon
      };

      // When
      const rewards = RewardCalculator.calculate(params);
      const totalPoints = rewards.reduce((sum: number, reward: Reward) => sum + reward.points, 0);

      // Then
      // 完了20 + 初クリア100 + 新記録50 + ノーミス30 = 200
      expect(totalPoints).toBe(200);
    });

    it('Given 普通モードで全報酬達成 When 報酬を計算する Then 総ポイントは400である', () => {
      // Given
      const params = {
        difficulty: Difficulty.NORMAL,
        isFirstClear: true,
        isNewRecord: true,
        mistakes: 0,
        completionTime: 300,
        pokemon: mockPokemon
      };

      // When
      const rewards = RewardCalculator.calculate(params);
      const totalPoints = rewards.reduce((sum: number, reward: Reward) => sum + reward.points, 0);

      // Then
      // 完了40 + 初クリア200 + 新記録100 + ノーミス60 = 400
      expect(totalPoints).toBe(400);
    });

    it('Given 難しいモードで全報酬達成 When 報酬を計算する Then 総ポイントは600である', () => {
      // Given
      const params = {
        difficulty: Difficulty.HARD,
        isFirstClear: true,
        isNewRecord: true,
        mistakes: 0,
        completionTime: 300,
        pokemon: mockPokemon
      };

      // When
      const rewards = RewardCalculator.calculate(params);
      const totalPoints = rewards.reduce((sum: number, reward: Reward) => sum + reward.points, 0);

      // Then
      // 完了60 + 初クリア300 + 新記録150 + ノーミス90 = 600
      expect(totalPoints).toBe(600);
    });
  });
});
