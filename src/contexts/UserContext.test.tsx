import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { UserProvider, useUser } from './UserContext';
import { Difficulty } from '../types';
import { StorageService } from '../services/StorageService';

// StorageServiceをモック化
vi.mock('../services/StorageService');

describe('UserContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // デフォルトのモック実装
    vi.mocked(StorageService.loadUserData).mockReturnValue({
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
    });
  });

  describe('ユーザーデータの初期化', () => {
    it('Given UserProviderがマウントされる When 初期化される Then StorageServiceからデータが読み込まれる', () => {
      // Given
      const mockUserData = {
        points: 150,
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
      };
      vi.mocked(StorageService.loadUserData).mockReturnValue(mockUserData);

      // When
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      });

      // Then
      expect(StorageService.loadUserData).toHaveBeenCalledOnce();
      expect(result.current.userData).toEqual(mockUserData);
    });

    it('Given StorageServiceがデフォルトデータを返す When 初期化される Then デフォルトのUserDataが設定される', () => {
      // Given & When
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      });

      // Then
      expect(result.current.userData.points).toBe(0);
      expect(result.current.userData.ownedPokemon).toEqual([]);
      expect(result.current.userData.stats[Difficulty.EASY].totalPlays).toBe(0);
    });
  });

  describe('ポイント追加', () => {
    it('Given ユーザーが0ポイント持っている When 100ポイント追加する Then ポイントが100になる', () => {
      // Given
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      });

      // When
      act(() => {
        result.current.addPoints(100);
      });

      // Then
      expect(result.current.userData.points).toBe(100);
      expect(StorageService.saveUserData).toHaveBeenCalled();
    });

    it('Given ユーザーが50ポイント持っている When 75ポイント追加する Then ポイントが125になる', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 50,
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
      });

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      });

      // When
      act(() => {
        result.current.addPoints(75);
      });

      // Then
      expect(result.current.userData.points).toBe(125);
    });

    it('Given ポイントを追加する When 複数回追加する Then ポイントが累積される', () => {
      // Given
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      });

      // When
      act(() => {
        result.current.addPoints(50);
        result.current.addPoints(30);
        result.current.addPoints(20);
      });

      // Then
      expect(result.current.userData.points).toBe(100);
    });
  });

  describe('ポイント消費', () => {
    it('Given ユーザーが100ポイント持っている When 50ポイント消費する Then ポイントが50になる', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
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
      });

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      });

      // When
      act(() => {
        result.current.spendPoints(50);
      });

      // Then
      expect(result.current.userData.points).toBe(50);
      expect(StorageService.saveUserData).toHaveBeenCalled();
    });

    it('Given ユーザーが50ポイント持っている When 100ポイント消費しようとする Then エラーが投げられる', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 50,
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
      });

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      });

      // When & Then
      expect(() => {
        act(() => {
          result.current.spendPoints(100);
        });
      }).toThrow('ポイントが足りません');
    });

    it('Given ユーザーが100ポイント持っている When 負の値を消費しようとする Then エラーが投げられる', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
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
      });

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      });

      // When & Then
      expect(() => {
        act(() => {
          result.current.spendPoints(-10);
        });
      }).toThrow('無効なポイント数です');
    });
  });

  describe('ポケモン追加', () => {
    it('Given ユーザーがポケモンを持っていない When ポケモンID 25を追加する Then ownedPokemonに追加される', () => {
      // Given
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      });

      // When
      act(() => {
        result.current.addPokemon(25);
      });

      // Then
      expect(result.current.userData.ownedPokemon).toContain(25);
      expect(result.current.userData.ownedPokemon).toHaveLength(1);
      expect(StorageService.saveUserData).toHaveBeenCalled();
    });

    it('Given ユーザーがポケモンID 1を持っている When ポケモンID 25を追加する Then 両方のIDが含まれる', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 0,
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
      });

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      });

      // When
      act(() => {
        result.current.addPokemon(25);
      });

      // Then
      expect(result.current.userData.ownedPokemon).toEqual([1, 25]);
    });

    it('Given ユーザーがポケモンID 25を持っている When 同じポケモンID 25を追加する Then 重複して追加される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 0,
        ownedPokemon: [25],
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
      });

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      });

      // When
      act(() => {
        result.current.addPokemon(25);
      });

      // Then
      expect(result.current.userData.ownedPokemon).toEqual([25, 25]);
      expect(result.current.userData.ownedPokemon).toHaveLength(2);
    });
  });

  describe('統計更新', () => {
    it('Given 簡単モードの統計が初期状態である When 120秒でクリアする Then bestTimeが更新される', () => {
      // Given
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      });

      // When
      act(() => {
        result.current.updateStats(Difficulty.EASY, 120, true);
      });

      // Then
      expect(result.current.userData.stats[Difficulty.EASY].bestTime).toBe(120);
      expect(result.current.userData.stats[Difficulty.EASY].totalPlays).toBe(1);
      expect(result.current.userData.stats[Difficulty.EASY].firstClearAchieved).toBe(true);
      expect(StorageService.saveUserData).toHaveBeenCalled();
    });

    it('Given 簡単モードのbestTimeが120秒である When 100秒でクリアする Then bestTimeが更新される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 0,
        ownedPokemon: [],
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
      });

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      });

      // When
      act(() => {
        result.current.updateStats(Difficulty.EASY, 100, true);
      });

      // Then
      expect(result.current.userData.stats[Difficulty.EASY].bestTime).toBe(100);
      expect(result.current.userData.stats[Difficulty.EASY].totalPlays).toBe(2);
    });

    it('Given 簡単モードのbestTimeが100秒である When 120秒でクリアする Then bestTimeは更新されない', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 0,
        ownedPokemon: [],
        stats: {
          [Difficulty.EASY]: {
            bestTime: 100,
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
      });

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      });

      // When
      act(() => {
        result.current.updateStats(Difficulty.EASY, 120, true);
      });

      // Then
      expect(result.current.userData.stats[Difficulty.EASY].bestTime).toBe(100);
      expect(result.current.userData.stats[Difficulty.EASY].totalPlays).toBe(2);
    });

    it('Given 統計が初期状態である When クリアせずに終了する Then totalPlaysのみ増加する', () => {
      // Given
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      });

      // When
      act(() => {
        result.current.updateStats(Difficulty.NORMAL, 0, false);
      });

      // Then
      expect(result.current.userData.stats[Difficulty.NORMAL].bestTime).toBeNull();
      expect(result.current.userData.stats[Difficulty.NORMAL].totalPlays).toBe(1);
      expect(result.current.userData.stats[Difficulty.NORMAL].firstClearAchieved).toBe(false);
    });

    it('Given 複数の難易度でプレイする When それぞれの統計を更新する Then 各難易度の統計が独立して管理される', () => {
      // Given
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      });

      // When
      act(() => {
        result.current.updateStats(Difficulty.EASY, 120, true);
        result.current.updateStats(Difficulty.NORMAL, 180, true);
        result.current.updateStats(Difficulty.HARD, 240, true);
      });

      // Then
      expect(result.current.userData.stats[Difficulty.EASY].bestTime).toBe(120);
      expect(result.current.userData.stats[Difficulty.NORMAL].bestTime).toBe(180);
      expect(result.current.userData.stats[Difficulty.HARD].bestTime).toBe(240);
      expect(result.current.userData.stats[Difficulty.EASY].totalPlays).toBe(1);
      expect(result.current.userData.stats[Difficulty.NORMAL].totalPlays).toBe(1);
      expect(result.current.userData.stats[Difficulty.HARD].totalPlays).toBe(1);
    });
  });

  describe('レベル統計更新', () => {
    it('Given レベル1の統計が初期状態である When 120秒でクリアする Then レベル統計が更新される', () => {
      // Given
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      });

      // When
      act(() => {
        result.current.updateLevelStats(1, 120, true, 3);
      });

      // Then
      expect(result.current.userData.levelStats?.[1]?.bestTime).toBe(120);
      expect(result.current.userData.levelStats?.[1]?.totalPlays).toBe(1);
      expect(result.current.userData.levelStats?.[1]?.cleared).toBe(true);
      expect(result.current.userData.levelStats?.[1]?.stars).toBe(3);
      expect(StorageService.saveUserData).toHaveBeenCalled();
    });

    it('Given レベル1のbestTimeが120秒である When 100秒でクリアする Then bestTimeが更新される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
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
      });

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      });

      // When
      act(() => {
        result.current.updateLevelStats(1, 100, true, 3);
      });

      // Then
      expect(result.current.userData.levelStats?.[1]?.bestTime).toBe(100);
      expect(result.current.userData.levelStats?.[1]?.totalPlays).toBe(2);
      expect(result.current.userData.levelStats?.[1]?.stars).toBe(3);
    });

    it('Given レベル1のbestTimeが100秒である When 120秒でクリアする Then bestTimeは更新されない', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
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
        },
        levelStats: {
          1: {
            level: 1,
            bestTime: 100,
            totalPlays: 1,
            cleared: true,
            stars: 3
          }
        },
        highestUnlockedLevel: 2
      });

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      });

      // When
      act(() => {
        result.current.updateLevelStats(1, 120, true, 2);
      });

      // Then
      expect(result.current.userData.levelStats?.[1]?.bestTime).toBe(100);
      expect(result.current.userData.levelStats?.[1]?.totalPlays).toBe(2);
      expect(result.current.userData.levelStats?.[1]?.stars).toBe(3);
    });

    it('Given レベル統計が初期状態である When クリアせずに終了する Then totalPlaysのみ増加する', () => {
      // Given
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      });

      // When
      act(() => {
        result.current.updateLevelStats(1, 0, false, 0);
      });

      // Then
      expect(result.current.userData.levelStats?.[1]?.bestTime).toBeNull();
      expect(result.current.userData.levelStats?.[1]?.totalPlays).toBe(1);
      expect(result.current.userData.levelStats?.[1]?.cleared).toBe(false);
      expect(result.current.userData.levelStats?.[1]?.stars).toBe(0);
    });
  });

  describe('レベルアンロック機能', () => {
    it('Given レベル1をクリアする When updateLevelStatsを呼ぶ Then レベル2がアンロックされる', () => {
      // Given
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      });

      // When
      act(() => {
        result.current.updateLevelStats(1, 120, true, 3);
      });

      // Then
      expect(result.current.userData.highestUnlockedLevel).toBe(2);
      expect(result.current.isLevelUnlocked(1)).toBe(true);
      expect(result.current.isLevelUnlocked(2)).toBe(true);
      expect(result.current.isLevelUnlocked(3)).toBe(false);
    });

    it('Given レベル5をクリアする When updateLevelStatsを呼ぶ Then レベル6がアンロックされる', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
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
        },
        highestUnlockedLevel: 5
      });

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      });

      // When
      act(() => {
        result.current.updateLevelStats(5, 180, true, 2);
      });

      // Then
      expect(result.current.userData.highestUnlockedLevel).toBe(6);
      expect(result.current.isLevelUnlocked(6)).toBe(true);
      expect(result.current.isLevelUnlocked(7)).toBe(false);
    });

    it('Given レベル20をクリアする When updateLevelStatsを呼ぶ Then highestUnlockedLevelは20のまま', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
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
        },
        highestUnlockedLevel: 20
      });

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      });

      // When
      act(() => {
        result.current.updateLevelStats(20, 240, true, 3);
      });

      // Then
      expect(result.current.userData.highestUnlockedLevel).toBe(20);
    });

    it('Given レベル3がアンロック済みである When レベル1をクリアする Then highestUnlockedLevelは3のまま', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
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
        },
        highestUnlockedLevel: 3
      });

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      });

      // When
      act(() => {
        result.current.updateLevelStats(1, 120, true, 3);
      });

      // Then
      expect(result.current.userData.highestUnlockedLevel).toBe(3);
    });

    it('Given レベル1をクリアせずに終了する When updateLevelStatsを呼ぶ Then レベル2はアンロックされない', () => {
      // Given
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      });

      // When
      act(() => {
        result.current.updateLevelStats(1, 0, false, 0);
      });

      // Then
      expect(result.current.userData.highestUnlockedLevel).toBe(1);
      expect(result.current.isLevelUnlocked(2)).toBe(false);
    });

    it('Given unlockLevel関数を使用する When レベル5を直接アンロックする Then レベル5がアンロックされる', () => {
      // Given
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      });

      // When
      act(() => {
        result.current.unlockLevel(5);
      });

      // Then
      expect(result.current.userData.highestUnlockedLevel).toBe(5);
      expect(result.current.isLevelUnlocked(5)).toBe(true);
      expect(result.current.isLevelUnlocked(4)).toBe(true);
      expect(result.current.isLevelUnlocked(6)).toBe(false);
    });

    it('Given highestUnlockedLevelが10である When レベル5を直接アンロックしようとする Then highestUnlockedLevelは10のまま', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
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
        },
        highestUnlockedLevel: 10
      });

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      });

      // When
      act(() => {
        result.current.unlockLevel(5);
      });

      // Then
      expect(result.current.userData.highestUnlockedLevel).toBe(10);
    });
  });

  describe('統合シナリオ', () => {
    it('Given ユーザーがゲームをプレイする When ポイント獲得、ポケモン追加、統計更新を行う Then 全ての状態が正しく更新される', () => {
      // Given
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      });

      // When
      act(() => {
        // ゲームクリアで報酬獲得
        result.current.addPoints(150);
        result.current.addPokemon(25);
        result.current.updateStats(Difficulty.EASY, 120, true);
        
        // ガチャを引く
        result.current.spendPoints(100);
        result.current.addPokemon(150);
      });

      // Then
      expect(result.current.userData.points).toBe(50);
      expect(result.current.userData.ownedPokemon).toEqual([25, 150]);
      expect(result.current.userData.stats[Difficulty.EASY].bestTime).toBe(120);
      expect(result.current.userData.stats[Difficulty.EASY].totalPlays).toBe(1);
      expect(result.current.userData.stats[Difficulty.EASY].firstClearAchieved).toBe(true);
    });

    it('Given ユーザーがレベルシステムでプレイする When レベル1からレベル3まで順番にクリアする Then 各レベルがアンロックされる', () => {
      // Given
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider
      });

      // When
      act(() => {
        // レベル1をクリア
        result.current.updateLevelStats(1, 120, true, 3);
        result.current.addPoints(100);
        
        // レベル2をクリア
        result.current.updateLevelStats(2, 150, true, 2);
        result.current.addPoints(150);
        
        // レベル3をクリア
        result.current.updateLevelStats(3, 180, true, 3);
        result.current.addPoints(200);
      });

      // Then
      expect(result.current.userData.points).toBe(450);
      expect(result.current.userData.highestUnlockedLevel).toBe(4);
      expect(result.current.userData.levelStats?.[1]?.cleared).toBe(true);
      expect(result.current.userData.levelStats?.[2]?.cleared).toBe(true);
      expect(result.current.userData.levelStats?.[3]?.cleared).toBe(true);
      expect(result.current.isLevelUnlocked(4)).toBe(true);
      expect(result.current.isLevelUnlocked(5)).toBe(false);
    });
  });
});
