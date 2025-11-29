import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Difficulty, Rarity, type Pokemon } from '../../types';
import { PokeApiService } from '../../services/PokeApiService';
import { DifficultySelector } from './DifficultySelector';

// PokeApiServiceをモック化
vi.mock('../../services/PokeApiService');

describe('DifficultySelector', () => {
  let mockPokemon: Pokemon;
  let mockOnStart: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // モックポケモンデータ
    mockPokemon = {
      id: 25,
      name: 'pikachu',
      imageUrl: 'https://example.com/pikachu.png',
      rarity: Rarity.COMMON
    };
    
    // PokeApiServiceのモック実装
    vi.mocked(PokeApiService.fetchRandomPokemon).mockResolvedValue(mockPokemon);
    
    // コールバック関数のモック
    mockOnStart = vi.fn();
  });

  describe('難易度ボタンの表示', () => {
    it('Given DifficultySelector が表示される When レンダリングされる Then 3つの難易度ボタンが表示される', () => {
      // Given & When
      render(<DifficultySelector onStart={mockOnStart} />);

      // Then
      expect(screen.getByRole('button', { name: /簡単/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /普通/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /難しい/i })).toBeInTheDocument();
    });

    it('Given DifficultySelector が表示される When レンダリングされる Then 全てのボタンが有効である', () => {
      // Given & When
      render(<DifficultySelector onStart={mockOnStart} />);

      // Then
      expect(screen.getByRole('button', { name: /簡単/i })).toBeEnabled();
      expect(screen.getByRole('button', { name: /普通/i })).toBeEnabled();
      expect(screen.getByRole('button', { name: /難しい/i })).toBeEnabled();
    });
  });

  describe('難易度選択時の動作', () => {
    it('Given ユーザーが簡単ボタンをクリックする When PokeAPIからポケモンを取得する Then onStartが簡単モードとポケモンで呼ばれる', async () => {
      // Given
      const user = userEvent.setup();
      render(<DifficultySelector onStart={mockOnStart} />);

      // When
      const easyButton = screen.getByRole('button', { name: /簡単/i });
      await user.click(easyButton);

      // Then
      await waitFor(() => {
        expect(PokeApiService.fetchRandomPokemon).toHaveBeenCalledOnce();
        expect(mockOnStart).toHaveBeenCalledWith(Difficulty.EASY, mockPokemon);
      });
    });

    it('Given ユーザーが普通ボタンをクリックする When PokeAPIからポケモンを取得する Then onStartが普通モードとポケモンで呼ばれる', async () => {
      // Given
      const user = userEvent.setup();
      render(<DifficultySelector onStart={mockOnStart} />);

      // When
      const normalButton = screen.getByRole('button', { name: /普通/i });
      await user.click(normalButton);

      // Then
      await waitFor(() => {
        expect(PokeApiService.fetchRandomPokemon).toHaveBeenCalledOnce();
        expect(mockOnStart).toHaveBeenCalledWith(Difficulty.NORMAL, mockPokemon);
      });
    });

    it('Given ユーザーが難しいボタンをクリックする When PokeAPIからポケモンを取得する Then onStartが難しいモードとポケモンで呼ばれる', async () => {
      // Given
      const user = userEvent.setup();
      render(<DifficultySelector onStart={mockOnStart} />);

      // When
      const hardButton = screen.getByRole('button', { name: /難しい/i });
      await user.click(hardButton);

      // Then
      await waitFor(() => {
        expect(PokeApiService.fetchRandomPokemon).toHaveBeenCalledOnce();
        expect(mockOnStart).toHaveBeenCalledWith(Difficulty.HARD, mockPokemon);
      });
    });
  });

  describe('ローディング状態の表示', () => {
    it('Given ユーザーが難易度を選択する When PokeAPI通信中である Then ローディング表示が表示される', async () => {
      // Given
      const user = userEvent.setup();
      
      // PokeAPIの応答を遅延させる
      vi.mocked(PokeApiService.fetchRandomPokemon).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockPokemon), 100))
      );
      
      render(<DifficultySelector onStart={mockOnStart} />);

      // When
      const easyButton = screen.getByRole('button', { name: /簡単/i });
      await user.click(easyButton);

      // Then
      expect(screen.getByText(/ポケモンを探しています/i)).toBeInTheDocument();
      
      // ローディングが終わるまで待つ
      await waitFor(() => {
        expect(screen.queryByText(/ポケモンを探しています/i)).not.toBeInTheDocument();
      });
    });

    it('Given PokeAPI通信中である When ローディング状態である Then 全てのボタンが無効化される', async () => {
      // Given
      const user = userEvent.setup();
      
      // PokeAPIの応答を遅延させる
      vi.mocked(PokeApiService.fetchRandomPokemon).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockPokemon), 100))
      );
      
      render(<DifficultySelector onStart={mockOnStart} />);

      // When
      const easyButton = screen.getByRole('button', { name: /簡単/i });
      await user.click(easyButton);

      // Then
      expect(screen.getByRole('button', { name: /簡単/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /普通/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /難しい/i })).toBeDisabled();
      
      // ローディングが終わるまで待つ
      await waitFor(() => {
        expect(mockOnStart).toHaveBeenCalled();
      });
    });

    it('Given PokeAPI通信が完了する When ローディングが終わる Then ローディング表示が消える', async () => {
      // Given
      const user = userEvent.setup();
      render(<DifficultySelector onStart={mockOnStart} />);

      // When
      const easyButton = screen.getByRole('button', { name: /簡単/i });
      await user.click(easyButton);

      // Then
      await waitFor(() => {
        expect(screen.queryByText(/読み込み中/i)).not.toBeInTheDocument();
        expect(mockOnStart).toHaveBeenCalledWith(Difficulty.EASY, mockPokemon);
      });
    });
  });

  describe('エラーハンドリング', () => {
    it('Given PokeAPI通信がエラーになる When 難易度を選択する Then エラーメッセージが表示される', async () => {
      // Given
      const user = userEvent.setup();
      vi.mocked(PokeApiService.fetchRandomPokemon).mockRejectedValue(
        new Error('Network error')
      );
      
      render(<DifficultySelector onStart={mockOnStart} />);

      // When
      const easyButton = screen.getByRole('button', { name: /簡単/i });
      await user.click(easyButton);

      // Then
      await waitFor(() => {
        expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument();
      });
      expect(mockOnStart).not.toHaveBeenCalled();
    });

    it('Given PokeAPI通信がエラーになる When エラーが表示される Then ボタンが再度有効になる', async () => {
      // Given
      const user = userEvent.setup();
      vi.mocked(PokeApiService.fetchRandomPokemon).mockRejectedValue(
        new Error('Network error')
      );
      
      render(<DifficultySelector onStart={mockOnStart} />);

      // When
      const easyButton = screen.getByRole('button', { name: /簡単/i });
      await user.click(easyButton);

      // Then
      await waitFor(() => {
        expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument();
      });
      
      expect(screen.getByRole('button', { name: /簡単/i })).toBeEnabled();
      expect(screen.getByRole('button', { name: /普通/i })).toBeEnabled();
      expect(screen.getByRole('button', { name: /難しい/i })).toBeEnabled();
    });
  });
});
