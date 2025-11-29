import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageService } from './StorageService';
import { Difficulty, type UserData } from '../types';

describe('StorageService', () => {
  beforeEach(() => {
    // LocalStorageをクリア
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('デフォルトデータの生成', () => {
    it('Given LocalStorageが空である When loadUserData を呼ぶ Then デフォルトのUserDataが返される', () => {
      // Given & When
      const userData = StorageService.loadUserData();

      // Then
      expect(userData.points).toBe(0);
      expect(userData.ownedPokemon).toEqual([]);
      expect(userData.stats).toBeDefined();
      expect(userData.stats[Difficulty.EASY]).toEqual({
        bestTime: null,
        totalPlays: 0,
        firstClearAchieved: false
      });
      expect(userData.stats[Difficulty.NORMAL]).toEqual({
        bestTime: null,
        totalPlays: 0,
        firstClearAchieved: false
      });
      expect(userData.stats[Difficulty.HARD]).toEqual({
        bestTime: null,
        totalPlays: 0,
        firstClearAchieved: false
      });
    });
  });

  describe('ユーザーデータの保存と読み込み', () => {
    it('Given ユーザーデータが存在する When saveUserData を呼ぶ Then LocalStorageに保存される', () => {
      // Given
      const userData: UserData = {
        points: 150,
        ownedPokemon: [1, 25, 150],
        stats: {
          [Difficulty.EASY]: {
            bestTime: 120,
            totalPlays: 5,
            firstClearAchieved: true
          },
          [Difficulty.NORMAL]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          },
          [Difficulty.HARD]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          }
        }
      };

      // When
      StorageService.saveUserData(userData);

      // Then
      const saved = localStorage.getItem('pokemon_math_user_data');
      expect(saved).toBeDefined();
      const parsed = JSON.parse(saved!);
      expect(parsed).toEqual(userData);
    });

    it('Given LocalStorageにデータが保存されている When loadUserData を呼ぶ Then 保存されたデータが返される', () => {
      // Given
      const userData: UserData = {
        points: 200,
        ownedPokemon: [4, 7, 25],
        stats: {
          [Difficulty.EASY]: {
            bestTime: 100,
            totalPlays: 10,
            firstClearAchieved: true
          },
          [Difficulty.NORMAL]: {
            bestTime: 180,
            totalPlays: 3,
            firstClearAchieved: true
          },
          [Difficulty.HARD]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          }
        },
        levelStats: {
          1: {
            level: 1,
            bestTime: 90,
            totalPlays: 5,
            cleared: true,
            stars: 3
          }
        },
        highestUnlockedLevel: 2 as any
      };
      localStorage.setItem('pokemon_math_user_data', JSON.stringify(userData));

      // When
      const loaded = StorageService.loadUserData();

      // Then
      expect(loaded).toEqual(userData);
    });

    it('Given データを保存して読み込む When 複数回操作する Then データの整合性が保たれる', () => {
      // Given
      const initialData: UserData = {
        points: 50,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          },
          [Difficulty.NORMAL]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          },
          [Difficulty.HARD]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          }
        }
      };

      // When
      StorageService.saveUserData(initialData);
      const loaded1 = StorageService.loadUserData();
      
      // ポイントを追加
      loaded1.points = 150;
      loaded1.ownedPokemon.push(25);
      StorageService.saveUserData(loaded1);
      
      const loaded2 = StorageService.loadUserData();

      // Then
      expect(loaded2.points).toBe(150);
      expect(loaded2.ownedPokemon).toEqual([1, 25]);
    });
  });

  describe('レベル統計の保存と読み込み', () => {
    it('Given レベル統計を含むユーザーデータが存在する When saveUserData を呼ぶ Then LocalStorageに保存される', () => {
      // Given
      const userData: UserData = {
        points: 200,
        ownedPokemon: [1, 25],
        stats: {
          [Difficulty.EASY]: {
            bestTime: 120,
            totalPlays: 5,
            firstClearAchieved: true
          },
          [Difficulty.NORMAL]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          },
          [Difficulty.HARD]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          }
        },
        levelStats: {
          1: {
            level: 1,
            bestTime: 100,
            totalPlays: 3,
            cleared: true,
            stars: 3
          },
          2: {
            level: 2,
            bestTime: 150,
            totalPlays: 2,
            cleared: true,
            stars: 2
          }
        },
        highestUnlockedLevel: 3
      };

      // When
      StorageService.saveUserData(userData);

      // Then
      const saved = localStorage.getItem('pokemon_math_user_data');
      expect(saved).toBeDefined();
      const parsed = JSON.parse(saved!);
      expect(parsed.levelStats).toEqual(userData.levelStats);
      expect(parsed.highestUnlockedLevel).toBe(3);
    });

    it('Given LocalStorageにレベル統計が保存されている When loadUserData を呼ぶ Then レベル統計が正しく読み込まれる', () => {
      // Given
      const userData: UserData = {
        points: 300,
        ownedPokemon: [4, 7, 25],
        stats: {
          [Difficulty.EASY]: {
            bestTime: 100,
            totalPlays: 10,
            firstClearAchieved: true
          },
          [Difficulty.NORMAL]: {
            bestTime: 180,
            totalPlays: 3,
            firstClearAchieved: true
          },
          [Difficulty.HARD]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          }
        },
        levelStats: {
          1: {
            level: 1,
            bestTime: 90,
            totalPlays: 5,
            cleared: true,
            stars: 3
          },
          2: {
            level: 2,
            bestTime: 120,
            totalPlays: 4,
            cleared: true,
            stars: 3
          },
          3: {
            level: 3,
            bestTime: 180,
            totalPlays: 2,
            cleared: true,
            stars: 2
          }
        },
        highestUnlockedLevel: 4
      };
      localStorage.setItem('pokemon_math_user_data', JSON.stringify(userData));

      // When
      const loaded = StorageService.loadUserData();

      // Then
      expect(loaded.levelStats).toEqual(userData.levelStats);
      expect(loaded.highestUnlockedLevel).toBe(4);
      expect(loaded.levelStats?.[1]?.bestTime).toBe(90);
      expect(loaded.levelStats?.[1]?.cleared).toBe(true);
      expect(loaded.levelStats?.[1]?.stars).toBe(3);
    });

    it('Given LocalStorageにレベル統計がない When loadUserData を呼ぶ Then 空のlevelStatsとhighestUnlockedLevel=1が初期化される', () => {
      // Given
      const userData = {
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          },
          [Difficulty.NORMAL]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          },
          [Difficulty.HARD]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          }
        }
        // levelStats と highestUnlockedLevel がない
      };
      localStorage.setItem('pokemon_math_user_data', JSON.stringify(userData));

      // When
      const loaded = StorageService.loadUserData();

      // Then
      expect(loaded.levelStats).toEqual({});
      expect(loaded.highestUnlockedLevel).toBe(1);
    });

    it('Given 複数のレベル統計を更新する When 保存して読み込む Then データの整合性が保たれる', () => {
      // Given
      const initialData: UserData = {
        points: 50,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          },
          [Difficulty.NORMAL]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          },
          [Difficulty.HARD]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          }
        },
        levelStats: {
          1: {
            level: 1,
            bestTime: 120,
            totalPlays: 1,
            cleared: true,
            stars: 2
          }
        },
        highestUnlockedLevel: 2
      };

      // When
      StorageService.saveUserData(initialData);
      const loaded1 = StorageService.loadUserData();
      
      // レベル2の統計を追加
      loaded1.levelStats = {
        ...loaded1.levelStats,
        2: {
          level: 2,
          bestTime: 150,
          totalPlays: 1,
          cleared: true,
          stars: 3
        }
      };
      loaded1.highestUnlockedLevel = 3;
      StorageService.saveUserData(loaded1);
      
      const loaded2 = StorageService.loadUserData();

      // Then
      expect(loaded2.levelStats?.[1]?.bestTime).toBe(120);
      expect(loaded2.levelStats?.[2]?.bestTime).toBe(150);
      expect(loaded2.highestUnlockedLevel).toBe(3);
    });
  });

  describe('データ移行機能', () => {
    it('Given EASY難易度のプレイ履歴がある When loadUserData を呼ぶ Then レベル3に統計が移行される', () => {
      // Given
      const oldData = {
        points: 100,
        ownedPokemon: [1, 25],
        stats: {
          [Difficulty.EASY]: {
            bestTime: 120,
            totalPlays: 5,
            firstClearAchieved: true
          },
          [Difficulty.NORMAL]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          },
          [Difficulty.HARD]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          }
        }
        // levelStats と highestUnlockedLevel がない（旧形式）
      };
      localStorage.setItem('pokemon_math_user_data', JSON.stringify(oldData));

      // When
      const loaded = StorageService.loadUserData();

      // Then
      expect(loaded.levelStats).toBeDefined();
      expect(loaded.levelStats?.[3]).toEqual({
        level: 3,
        bestTime: 120,
        totalPlays: 5,
        cleared: true,
        stars: 1
      });
      expect(loaded.highestUnlockedLevel).toBe(5);
    });

    it('Given NORMAL難易度のプレイ履歴がある When loadUserData を呼ぶ Then レベル8に統計が移行される', () => {
      // Given
      const oldData = {
        points: 200,
        ownedPokemon: [4, 7],
        stats: {
          [Difficulty.EASY]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          },
          [Difficulty.NORMAL]: {
            bestTime: 180,
            totalPlays: 8,
            firstClearAchieved: true
          },
          [Difficulty.HARD]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          }
        }
      };
      localStorage.setItem('pokemon_math_user_data', JSON.stringify(oldData));

      // When
      const loaded = StorageService.loadUserData();

      // Then
      expect(loaded.levelStats).toBeDefined();
      expect(loaded.levelStats?.[8]).toEqual({
        level: 8,
        bestTime: 180,
        totalPlays: 8,
        cleared: true,
        stars: 2
      });
      expect(loaded.highestUnlockedLevel).toBe(10);
    });

    it('Given HARD難易度のプレイ履歴がある When loadUserData を呼ぶ Then レベル13に統計が移行される', () => {
      // Given
      const oldData = {
        points: 300,
        ownedPokemon: [150],
        stats: {
          [Difficulty.EASY]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          },
          [Difficulty.NORMAL]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          },
          [Difficulty.HARD]: {
            bestTime: 240,
            totalPlays: 3,
            firstClearAchieved: true
          }
        }
      };
      localStorage.setItem('pokemon_math_user_data', JSON.stringify(oldData));

      // When
      const loaded = StorageService.loadUserData();

      // Then
      expect(loaded.levelStats).toBeDefined();
      expect(loaded.levelStats?.[13]).toEqual({
        level: 13,
        bestTime: 240,
        totalPlays: 3,
        cleared: true,
        stars: 3
      });
      expect(loaded.highestUnlockedLevel).toBe(15);
    });

    it('Given 複数の難易度のプレイ履歴がある When loadUserData を呼ぶ Then すべての統計が移行される', () => {
      // Given
      const oldData = {
        points: 500,
        ownedPokemon: [1, 4, 25, 150],
        stats: {
          [Difficulty.EASY]: {
            bestTime: 100,
            totalPlays: 10,
            firstClearAchieved: true
          },
          [Difficulty.NORMAL]: {
            bestTime: 150,
            totalPlays: 5,
            firstClearAchieved: true
          },
          [Difficulty.HARD]: {
            bestTime: 200,
            totalPlays: 2,
            firstClearAchieved: true
          }
        }
      };
      localStorage.setItem('pokemon_math_user_data', JSON.stringify(oldData));

      // When
      const loaded = StorageService.loadUserData();

      // Then
      expect(loaded.levelStats).toBeDefined();
      expect(loaded.levelStats?.[3]).toBeDefined();
      expect(loaded.levelStats?.[8]).toBeDefined();
      expect(loaded.levelStats?.[13]).toBeDefined();
      expect(loaded.highestUnlockedLevel).toBe(15); // HARDが最高なので15
    });

    it('Given プレイ履歴はあるがクリアしていない When loadUserData を呼ぶ Then clearedがfalseで移行される', () => {
      // Given
      const oldData = {
        points: 50,
        ownedPokemon: [],
        stats: {
          [Difficulty.EASY]: {
            bestTime: null,
            totalPlays: 3,
            firstClearAchieved: false
          },
          [Difficulty.NORMAL]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          },
          [Difficulty.HARD]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          }
        }
      };
      localStorage.setItem('pokemon_math_user_data', JSON.stringify(oldData));

      // When
      const loaded = StorageService.loadUserData();

      // Then
      expect(loaded.levelStats?.[3]).toEqual({
        level: 3,
        bestTime: null,
        totalPlays: 3,
        cleared: false,
        stars: 0
      });
      expect(loaded.highestUnlockedLevel).toBe(5);
    });

    it('Given プレイ履歴がない When loadUserData を呼ぶ Then 移行は実行されない', () => {
      // Given
      const oldData = {
        points: 0,
        ownedPokemon: [],
        stats: {
          [Difficulty.EASY]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          },
          [Difficulty.NORMAL]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          },
          [Difficulty.HARD]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          }
        }
      };
      localStorage.setItem('pokemon_math_user_data', JSON.stringify(oldData));

      // When
      const loaded = StorageService.loadUserData();

      // Then
      expect(loaded.levelStats).toEqual({});
      expect(loaded.highestUnlockedLevel).toBe(1);
    });

    it('Given すでに移行済みのデータ When loadUserData を呼ぶ Then 再度移行されない', () => {
      // Given
      const migratedData = {
        points: 200,
        ownedPokemon: [1, 25],
        stats: {
          [Difficulty.EASY]: {
            bestTime: 120,
            totalPlays: 5,
            firstClearAchieved: true
          },
          [Difficulty.NORMAL]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          },
          [Difficulty.HARD]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          }
        },
        levelStats: {
          3: {
            level: 3,
            bestTime: 120,
            totalPlays: 5,
            cleared: true,
            stars: 1
          }
        },
        highestUnlockedLevel: 5
      };
      localStorage.setItem('pokemon_math_user_data', JSON.stringify(migratedData));

      // When
      const loaded = StorageService.loadUserData();

      // Then
      expect(loaded.levelStats).toEqual(migratedData.levelStats);
      expect(loaded.highestUnlockedLevel).toBe(5);
      // 移行が再実行されていないことを確認（レベル3のみ存在）
      expect(Object.keys(loaded.levelStats || {}).length).toBe(1);
    });

    it('Given 移行が実行される When loadUserData を呼ぶ Then 移行後のデータがLocalStorageに保存される', () => {
      // Given
      const oldData = {
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: {
            bestTime: 90,
            totalPlays: 2,
            firstClearAchieved: true
          },
          [Difficulty.NORMAL]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          },
          [Difficulty.HARD]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          }
        }
      };
      localStorage.setItem('pokemon_math_user_data', JSON.stringify(oldData));

      // When
      const loaded = StorageService.loadUserData();

      // Then
      const saved = localStorage.getItem('pokemon_math_user_data');
      expect(saved).toBeDefined();
      const parsed = JSON.parse(saved!);
      expect(parsed.levelStats).toBeDefined();
      expect(parsed.highestUnlockedLevel).toBe(5);
      expect(parsed.levelStats[3]).toEqual({
        level: 3,
        bestTime: 90,
        totalPlays: 2,
        cleared: true,
        stars: 1
      });
    });
  });

  describe('QuotaExceededError ハンドリング', () => {
    it('Given LocalStorageが容量不足である When saveUserData を呼ぶ Then 現在のセッションを削除して再試行する', () => {
      // Given
      const userData: UserData = {
        points: 100,
        ownedPokemon: [1, 2, 3],
        stats: {
          [Difficulty.EASY]: {
            bestTime: 120,
            totalPlays: 1,
            firstClearAchieved: true
          },
          [Difficulty.NORMAL]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          },
          [Difficulty.HARD]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          }
        }
      };

      // 現在のセッションデータを設定
      localStorage.setItem('pokemon_math_current_session', 'dummy_session_data');

      // LocalStorage.setItemをモック化してQuotaExceededErrorを発生させる
      const originalSetItem = Storage.prototype.setItem;
      let callCount = 0;
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function(this: Storage, key: string, value: string) {
        callCount++;
        if (callCount === 1 && key === 'pokemon_math_user_data') {
          // 最初の呼び出しでエラーを投げる
          const error = new Error('QuotaExceededError');
          error.name = 'QuotaExceededError';
          throw error;
        }
        // 2回目以降は実際に保存
        originalSetItem.call(this, key, value);
      });

      // When
      StorageService.saveUserData(userData);

      // Then
      // セッションデータが削除されたことを確認
      expect(localStorage.getItem('pokemon_math_current_session')).toBeNull();
      
      // ユーザーデータが保存されたことを確認
      const saved = localStorage.getItem('pokemon_math_user_data');
      expect(saved).toBeDefined();
      expect(JSON.parse(saved!)).toEqual(userData);
      
      // setItemが2回呼ばれたことを確認（1回目失敗、2回目成功）
      expect(callCount).toBeGreaterThanOrEqual(2);
    });

    it('Given QuotaExceededError以外のエラーが発生する When saveUserData を呼ぶ Then エラーがそのまま投げられる', () => {
      // Given
      const userData: UserData = {
        points: 100,
        ownedPokemon: [],
        stats: {
          [Difficulty.EASY]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          },
          [Difficulty.NORMAL]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          },
          [Difficulty.HARD]: {
            bestTime: null,
            totalPlays: 0,
            firstClearAchieved: false
          }
        }
      };

      // 別のエラーを投げるようにモック化
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Some other error');
      });

      // When & Then
      expect(() => StorageService.saveUserData(userData)).toThrow('Some other error');
    });
  });
});
