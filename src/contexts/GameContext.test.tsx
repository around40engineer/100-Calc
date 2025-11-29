import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { GameProvider, useGame } from './GameContext';
import { Difficulty, type Pokemon, Rarity } from '../types';
import { PokeApiService } from '../services/PokeApiService';

// PokeApiServiceをモック化
vi.mock('../services/PokeApiService');

describe('GameContext', () => {
  let mockPokemon: Pokemon;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // モックポケモンデータ
    mockPokemon = {
      id: 25,
      name: 'pikachu',
      imageUrl: 'https://example.com/pikachu.png',
      rarity: Rarity.COMMON
    };
    
    // PokeApiServiceのモック実装
    vi.mocked(PokeApiService.fetchRandomPokemon).mockResolvedValue(mockPokemon);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('セッション開始', () => {
    it('Given ユーザーが簡単モードを選択する When セッションを開始する Then PokeApiServiceからポケモンを取得してセッションが作成される', async () => {
      // Given
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      });

      // When
      await act(async () => {
        await result.current.startSession(Difficulty.EASY);
      });

      // Then
      expect(PokeApiService.fetchRandomPokemon).toHaveBeenCalledOnce();
      expect(result.current.session).toBeDefined();
      expect(result.current.session?.difficulty).toBe(Difficulty.EASY);
      expect(result.current.session?.pokemon).toEqual(mockPokemon);
      expect(result.current.session?.cells).toHaveLength(10);
      expect(result.current.session?.cells[0]).toHaveLength(10);
      expect(result.current.session?.isCompleted).toBe(false);
      expect(result.current.session?.mistakes).toBe(0);
    });

    it('Given ユーザーがレベル1を選択する When セッションを開始する Then レベル1のセッションが作成される', async () => {
      // Given
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      });

      // When
      await act(async () => {
        await result.current.startSession(1);
      });

      // Then
      expect(PokeApiService.fetchRandomPokemon).toHaveBeenCalledOnce();
      expect(result.current.session).toBeDefined();
      expect(result.current.session?.difficulty).toBe(1);
      expect(result.current.session?.pokemon).toEqual(mockPokemon);
      expect(result.current.session?.cells).toHaveLength(10);
      expect(result.current.session?.cells[0]).toHaveLength(10);
      expect(result.current.session?.isCompleted).toBe(false);
      expect(result.current.session?.mistakes).toBe(0);
      expect(result.current.session?.timeLimit).toBe(600); // レベル1の制限時間
    });

    it('Given ユーザーがレベル10を選択する When セッションを開始する Then レベル10のセッションが作成される', async () => {
      // Given
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      });

      // When
      await act(async () => {
        await result.current.startSession(10);
      });

      // Then
      expect(result.current.session?.difficulty).toBe(10);
      expect(result.current.session?.pokemon).toEqual(mockPokemon);
      expect(result.current.session?.timeLimit).toBe(480); // レベル10の制限時間
    });

    it('Given ユーザーが普通モードを選択する When セッションを開始する Then 普通モードのセッションが作成される', async () => {
      // Given
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      });

      // When
      await act(async () => {
        await result.current.startSession(Difficulty.NORMAL);
      });

      // Then
      expect(result.current.session?.difficulty).toBe(Difficulty.NORMAL);
      expect(result.current.session?.pokemon).toEqual(mockPokemon);
    });

    it('Given ユーザーが難しいモードを選択する When セッションを開始する Then 難しいモードのセッションが作成される', async () => {
      // Given
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      });

      // When
      await act(async () => {
        await result.current.startSession(Difficulty.HARD);
      });

      // Then
      expect(result.current.session?.difficulty).toBe(Difficulty.HARD);
      expect(result.current.session?.pokemon).toEqual(mockPokemon);
    });

    it('Given セッションを開始する When 100個の問題が生成される Then 全てのセルに問題が設定される', async () => {
      // Given
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      });

      // When
      await act(async () => {
        await result.current.startSession(Difficulty.EASY);
      });

      // Then
      const cells = result.current.session?.cells;
      expect(cells).toBeDefined();
      
      let problemCount = 0;
      cells?.forEach((row: any) => {
        row.forEach((cell: any) => {
          expect(cell.problem).toBeDefined();
          expect(cell.problem.id).toBeDefined();
          expect(cell.userAnswer).toBeNull();
          expect(cell.isCorrect).toBeNull();
          expect(cell.isRevealed).toBe(false);
          problemCount++;
        });
      });
      
      expect(problemCount).toBe(100);
    });

    it('Given セッションを開始する When 制限時間が設定される Then startTimeとtimeLimitが設定される', async () => {
      // Given
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      });
      const startTime = Date.now();

      // When
      await act(async () => {
        await result.current.startSession(Difficulty.EASY);
      });

      // Then
      expect(result.current.session?.startTime).toBeGreaterThanOrEqual(startTime);
      expect(result.current.session?.timeLimit).toBeGreaterThan(0);
    });
  });

  describe('回答検証', () => {
    it('Given セッションが開始されている When 正しい答えを入力する Then セルが開いてisCorrectがtrueになる', async () => {
      // Given
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      });
      
      await act(async () => {
        await result.current.startSession(Difficulty.EASY);
      });

      const cell = result.current.session?.cells[0][0];
      const correctAnswer = cell?.problem.answer;

      // When
      act(() => {
        result.current.submitAnswer(0, 0, correctAnswer!);
      });

      // Then
      const updatedCell = result.current.session?.cells[0][0];
      expect(updatedCell?.userAnswer).toBe(correctAnswer);
      expect(updatedCell?.isCorrect).toBe(true);
      expect(updatedCell?.isRevealed).toBe(true);
      expect(result.current.session?.mistakes).toBe(0);
    });

    it('Given セッションが開始されている When 間違った答えを入力する Then セルは閉じたままでmistakesが増える', async () => {
      // Given
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      });
      
      await act(async () => {
        await result.current.startSession(Difficulty.EASY);
      });

      const cell = result.current.session?.cells[0][0];
      const wrongAnswer = cell!.problem.answer + 999;

      // When
      act(() => {
        result.current.submitAnswer(0, 0, wrongAnswer);
      });

      // Then
      const updatedCell = result.current.session?.cells[0][0];
      expect(updatedCell?.userAnswer).toBe(wrongAnswer);
      expect(updatedCell?.isCorrect).toBe(false);
      expect(updatedCell?.isRevealed).toBe(false);
      expect(result.current.session?.mistakes).toBe(1);
    });

    it('Given セッションが開始されている When 複数の問題に正解する Then 正解したセルが全て開く', async () => {
      // Given
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      });
      
      await act(async () => {
        await result.current.startSession(Difficulty.EASY);
      });

      // When
      act(() => {
        result.current.submitAnswer(0, 0, result.current.session!.cells[0][0].problem.answer);
        result.current.submitAnswer(0, 1, result.current.session!.cells[0][1].problem.answer);
        result.current.submitAnswer(1, 0, result.current.session!.cells[1][0].problem.answer);
      });

      // Then
      expect(result.current.session?.cells[0][0].isRevealed).toBe(true);
      expect(result.current.session?.cells[0][1].isRevealed).toBe(true);
      expect(result.current.session?.cells[1][0].isRevealed).toBe(true);
      expect(result.current.session?.mistakes).toBe(0);
    });

    it('Given セッションが開始されている When 正解と不正解を混ぜて入力する Then mistakesが正しくカウントされる', async () => {
      // Given
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      });
      
      await act(async () => {
        await result.current.startSession(Difficulty.EASY);
      });

      // When
      act(() => {
        // 正解
        result.current.submitAnswer(0, 0, result.current.session!.cells[0][0].problem.answer);
        // 不正解
        result.current.submitAnswer(0, 1, result.current.session!.cells[0][1].problem.answer + 999);
        // 正解
        result.current.submitAnswer(1, 0, result.current.session!.cells[1][0].problem.answer);
        // 不正解
        result.current.submitAnswer(1, 1, result.current.session!.cells[1][1].problem.answer + 999);
      });

      // Then
      expect(result.current.session?.cells[0][0].isRevealed).toBe(true);
      expect(result.current.session?.cells[0][1].isRevealed).toBe(false);
      expect(result.current.session?.cells[1][0].isRevealed).toBe(true);
      expect(result.current.session?.cells[1][1].isRevealed).toBe(false);
      expect(result.current.session?.mistakes).toBe(2);
    });
  });

  describe('タイマー管理', () => {
    it('Given セッションが開始されている When 時間が経過する Then 残り時間が減少する', async () => {
      // Given
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      });
      
      await act(async () => {
        await result.current.startSession(Difficulty.EASY);
      });

      const initialRemainingTime = result.current.remainingTime;

      // When
      act(() => {
        vi.advanceTimersByTime(5000); // 5秒進める
      });

      // Then
      expect(result.current.remainingTime).toBeLessThan(initialRemainingTime!);
      expect(result.current.remainingTime).toBeGreaterThanOrEqual(0);
    });

    it('Given セッションが開始されている When 制限時間が終了する Then セッションが自動的に終了する', async () => {
      // Given
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      });
      
      await act(async () => {
        await result.current.startSession(Difficulty.EASY);
      });

      const timeLimit = result.current.session!.timeLimit;

      // When
      act(() => {
        vi.advanceTimersByTime(timeLimit * 1000 + 1000); // 制限時間 + 1秒
      });

      // Then
      expect(result.current.remainingTime).toBe(0);
      expect(result.current.isTimeUp).toBe(true);
    });

    it('Given セッションが完了する When タイマーが停止する Then 残り時間の更新が停止する', async () => {
      // Given
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      });
      
      await act(async () => {
        await result.current.startSession(Difficulty.EASY);
      });

      // 全ての問題に正解してセッションを完了
      await act(async () => {
        for (let row = 0; row < 10; row++) {
          for (let col = 0; col < 10; col++) {
            result.current.submitAnswer(
              row,
              col,
              result.current.session!.cells[row][col].problem.answer
            );
          }
        }
      });

      const remainingTimeAfterCompletion = result.current.remainingTime;

      // When
      act(() => {
        vi.advanceTimersByTime(5000); // 5秒進める
      });

      // Then
      expect(result.current.remainingTime).toBe(remainingTimeAfterCompletion);
    });
  });

  describe('セッション完了', () => {
    it('Given セッションが開始されている When 全ての問題に正解する Then セッションが完了する', async () => {
      // Given
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      });
      
      await act(async () => {
        await result.current.startSession(Difficulty.EASY);
      });

      // When
      act(() => {
        for (let row = 0; row < 10; row++) {
          for (let col = 0; col < 10; col++) {
            result.current.submitAnswer(
              row,
              col,
              result.current.session!.cells[row][col].problem.answer
            );
          }
        }
      });

      // Then
      expect(result.current.session?.isCompleted).toBe(true);
      expect(result.current.session?.cells.every((row: any) => 
        row.every((cell: any) => cell.isRevealed)
      )).toBe(true);
    });

    it('Given セッションが開始されている When 完了時間を計算する Then 正しい経過時間が返される', async () => {
      // Given
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      });
      
      await act(async () => {
        await result.current.startSession(Difficulty.EASY);
      });

      // 10秒経過
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      // When
      act(() => {
        for (let row = 0; row < 10; row++) {
          for (let col = 0; col < 10; col++) {
            result.current.submitAnswer(
              row,
              col,
              result.current.session!.cells[row][col].problem.answer
            );
          }
        }
      });

      // Then
      const completionTime = result.current.getCompletionTime();
      expect(completionTime).toBeGreaterThanOrEqual(10);
      expect(completionTime).toBeLessThan(15); // 多少の誤差を許容
    });

    it('Given セッションが完了していない When getCompletionTimeを呼ぶ Then nullが返される', async () => {
      // Given
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      });
      
      await act(async () => {
        await result.current.startSession(Difficulty.EASY);
      });

      // When & Then
      expect(result.current.getCompletionTime()).toBeNull();
    });

    it('Given セッションが完了する When endSessionを呼ぶ Then セッションがリセットされる', async () => {
      // Given
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      });
      
      await act(async () => {
        await result.current.startSession(Difficulty.EASY);
      });

      act(() => {
        for (let row = 0; row < 10; row++) {
          for (let col = 0; col < 10; col++) {
            result.current.submitAnswer(
              row,
              col,
              result.current.session!.cells[row][col].problem.answer
            );
          }
        }
      });

      // When
      act(() => {
        result.current.endSession();
      });

      // Then
      expect(result.current.session).toBeNull();
      expect(result.current.remainingTime).toBeNull();
      expect(result.current.isTimeUp).toBe(false);
    });
  });

  describe('統合シナリオ', () => {
    it('Given ユーザーがゲームをプレイする When セッション開始から完了まで Then 全ての状態が正しく管理される', async () => {
      // Given
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      });

      // When - セッション開始
      await act(async () => {
        await result.current.startSession(Difficulty.EASY);
      });

      expect(result.current.session).toBeDefined();
      expect(result.current.session?.pokemon).toEqual(mockPokemon);

      // When - いくつかの問題に回答
      act(() => {
        result.current.submitAnswer(0, 0, result.current.session!.cells[0][0].problem.answer);
        result.current.submitAnswer(0, 1, result.current.session!.cells[0][1].problem.answer + 999); // 不正解
        result.current.submitAnswer(0, 2, result.current.session!.cells[0][2].problem.answer);
      });

      expect(result.current.session?.cells[0][0].isRevealed).toBe(true);
      expect(result.current.session?.cells[0][1].isRevealed).toBe(false);
      expect(result.current.session?.cells[0][2].isRevealed).toBe(true);
      expect(result.current.session?.mistakes).toBe(1);

      // When - 時間経過
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.remainingTime).toBeLessThan(result.current.session!.timeLimit);

      // When - 残りの問題を全て正解
      act(() => {
        for (let row = 0; row < 10; row++) {
          for (let col = 0; col < 10; col++) {
            if (!result.current.session!.cells[row][col].isRevealed) {
              result.current.submitAnswer(
                row,
                col,
                result.current.session!.cells[row][col].problem.answer
              );
            }
          }
        }
      });

      // Then
      expect(result.current.session?.isCompleted).toBe(true);
      expect(result.current.getCompletionTime()).toBeGreaterThan(0);
    });
  });
});
