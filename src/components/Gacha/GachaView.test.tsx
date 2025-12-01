import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GachaView } from './GachaView';
import { UserProvider } from '../../contexts/UserContext';
import { GachaService } from '../../services/GachaService';
import { Rarity, type Pokemon } from '../../types';
import { StorageService } from '../../services/StorageService';

// StorageServiceをモック化
vi.mock('../../services/StorageService', () => ({
  StorageService: {
    loadUserData: vi.fn(),
    saveUserData: vi.fn()
  }
}));

describe('GachaView', () => {
  let mockPokemon: Pokemon;

  beforeEach(() => {
    vi.clearAllMocks();

    // モックポケモンデータ
    mockPokemon = {
      id: 25,
      name: 'pikachu',
      japaneseName: 'ピカチュウ',
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
      rarity: Rarity.COMMON
    };

    // デフォルトのユーザーデータ
    vi.mocked(StorageService.loadUserData).mockReturnValue({
      points: 200,
      ownedPokemon: [],
      levelStats: {},
      highestUnlockedLevel: 1,
      stats: {
        easy: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
        normal: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
        hard: { bestTime: null, totalPlays: 0, firstClearAchieved: false }
      }
    });
  });

  describe('ガチャボタンの表示', () => {
    it('Given GachaView が表示される When 初期表示される Then ガチャボタンが表示される', () => {
      // Given & When
      render(
        <UserProvider>
          <GachaView />
        </UserProvider>
      );

      // Then
      expect(screen.getByRole('button', { name: /ガチャを引く/i })).toBeInTheDocument();
    });

    it('Given ユーザーが十分なポイントを持っている When 表示される Then ガチャボタンが有効である', () => {
      // Given & When
      render(
        <UserProvider>
          <GachaView />
        </UserProvider>
      );

      // Then
      const gachaButton = screen.getByRole('button', { name: /ガチャを引く/i });
      expect(gachaButton).not.toBeDisabled();
    });

    it('Given ガチャボタンが表示される When 表示される Then 必要ポイントが表示される', () => {
      // Given & When
      render(
        <UserProvider>
          <GachaView />
        </UserProvider>
      );

      // Then
      expect(screen.getByText(/100.*ポイント/i)).toBeInTheDocument();
    });

    it('Given ユーザーの現在ポイントが表示される When 表示される Then 正しいポイント数が表示される', () => {
      // Given & When
      render(
        <UserProvider>
          <GachaView />
        </UserProvider>
      );

      // Then
      expect(screen.getByText(/💰.*所持ポイント/i)).toBeInTheDocument();
      expect(screen.getByText(/200/)).toBeInTheDocument();
    });
  });

  describe('ポイント不足時のエラー表示', () => {
    it('Given ユーザーが100ポイント未満しか持っていない When 表示される Then ガチャボタンが無効である', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 50,
        ownedPokemon: [],
        stats: {
          easy: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          normal: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          hard: { bestTime: null, totalPlays: 0, firstClearAchieved: false }
        }
      });

      // When
      render(
        <UserProvider>
          <GachaView />
        </UserProvider>
      );

      // Then
      const gachaButton = screen.getByRole('button', { name: /ガチャを引く/i });
      expect(gachaButton).toBeDisabled();
    });

    it('Given ユーザーが50ポイントしか持っていない When ガチャを引こうとする Then エラーメッセージが表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 50,
        ownedPokemon: [],
        stats: {
          easy: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          normal: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          hard: { bestTime: null, totalPlays: 0, firstClearAchieved: false }
        }
      });

      // When
      render(
        <UserProvider>
          <GachaView />
        </UserProvider>
      );

      // Then
      expect(screen.getByText(/ポイントが足りません/i)).toBeInTheDocument();
    });

    it('Given ユーザーがちょうど100ポイント持っている When 表示される Then ガチャボタンが有効である', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [],
        stats: {
          easy: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          normal: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          hard: { bestTime: null, totalPlays: 0, firstClearAchieved: false }
        }
      });

      // When
      render(
        <UserProvider>
          <GachaView />
        </UserProvider>
      );

      // Then
      const gachaButton = screen.getByRole('button', { name: /ガチャを引く/i });
      expect(gachaButton).not.toBeDisabled();
    });
  });

  describe('ガチャ実行時の動作', () => {
    it('Given ユーザーが十分なポイントを持っている When ガチャボタンをクリックする Then ガチャが実行される', async () => {
      // Given
      const user = userEvent.setup();
      vi.spyOn(GachaService, 'pull').mockResolvedValue({
        success: true,
        pokemon: mockPokemon,
        remainingPoints: 100
      });

      render(
        <UserProvider>
          <GachaView />
        </UserProvider>
      );

      // When
      const gachaButton = screen.getByRole('button', { name: /ガチャを引く/i });
      await user.click(gachaButton);

      // Then
      await waitFor(() => {
        expect(GachaService.pull).toHaveBeenCalledWith(200, 1);
      });
    });

    it('Given ガチャが実行される When 成功する Then ポケモン獲得演出が表示される', async () => {
      // Given
      const user = userEvent.setup();
      vi.spyOn(GachaService, 'pull').mockResolvedValue({
        success: true,
        pokemon: mockPokemon,
        remainingPoints: 100
      });

      render(
        <UserProvider>
          <GachaView />
        </UserProvider>
      );

      // When
      const gachaButton = screen.getByRole('button', { name: /ガチャを引く/i });
      await user.click(gachaButton);

      // Then
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /ポケモンを獲得/i })).toBeInTheDocument();
      });
    });

    it('Given ガチャが実行される When 成功する Then 獲得したポケモンの画像が表示される', async () => {
      // Given
      const user = userEvent.setup();
      vi.spyOn(GachaService, 'pull').mockResolvedValue({
        success: true,
        pokemon: mockPokemon,
        remainingPoints: 100
      });

      render(
        <UserProvider>
          <GachaView />
        </UserProvider>
      );

      // When
      const gachaButton = screen.getByRole('button', { name: /ガチャを引く/i });
      await user.click(gachaButton);

      // Then
      await waitFor(() => {
        const pokemonImage = screen.getByAltText(/ピカチュウ/i);
        expect(pokemonImage).toBeInTheDocument();
        expect(pokemonImage).toHaveAttribute('src', mockPokemon.imageUrl);
      });
    });

    it('Given ガチャが実行される When 成功する Then 獲得したポケモンの名前が表示される', async () => {
      // Given
      const user = userEvent.setup();
      vi.spyOn(GachaService, 'pull').mockResolvedValue({
        success: true,
        pokemon: mockPokemon,
        remainingPoints: 100
      });

      render(
        <UserProvider>
          <GachaView />
        </UserProvider>
      );

      // When
      const gachaButton = screen.getByRole('button', { name: /ガチャを引く/i });
      await user.click(gachaButton);

      // Then
      await waitFor(() => {
        expect(screen.getByText(/pikachu/i)).toBeInTheDocument();
      });
    });

    it('Given ガチャが実行される When 成功する Then ポイントが減少する', async () => {
      // Given
      const user = userEvent.setup();
      vi.spyOn(GachaService, 'pull').mockResolvedValue({
        success: true,
        pokemon: mockPokemon,
        remainingPoints: 100
      });

      render(
        <UserProvider>
          <GachaView />
        </UserProvider>
      );

      // 初期ポイントを確認
      expect(screen.getByText(/所持ポイント/i)).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();

      // When
      const gachaButton = screen.getByRole('button', { name: /ガチャを引く/i });
      await user.click(gachaButton);

      // ガチャ結果モーダルを閉じる
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /閉じる/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /閉じる/i }));

      // Then - ポイントが減っていることを確認
      await waitFor(() => {
        expect(screen.getByText('100')).toBeInTheDocument();
      });
    });

    it('Given ガチャ実行中 When 処理中である Then ローディング表示がされる', async () => {
      // Given
      const user = userEvent.setup();
      vi.spyOn(GachaService, 'pull').mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          pokemon: mockPokemon,
          remainingPoints: 100
        }), 100))
      );

      render(
        <UserProvider>
          <GachaView />
        </UserProvider>
      );

      // When
      const gachaButton = screen.getByRole('button', { name: /ガチャを引く/i });
      await user.click(gachaButton);

      // Then
      expect(screen.getByText(/ガチャ中/i)).toBeInTheDocument();
      
      // 完了を待つ
      await waitFor(() => {
        expect(screen.queryByText(/ガチャ中/i)).not.toBeInTheDocument();
      });
    });

    it('Given ガチャ実行中 When 処理中である Then ガチャボタンが無効になる', async () => {
      // Given
      const user = userEvent.setup();
      vi.spyOn(GachaService, 'pull').mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          pokemon: mockPokemon,
          remainingPoints: 100
        }), 100))
      );

      render(
        <UserProvider>
          <GachaView />
        </UserProvider>
      );

      // When
      const gachaButton = screen.getByRole('button', { name: /ガチャを引く/i });
      await user.click(gachaButton);

      // Then
      expect(gachaButton).toBeDisabled();
      
      // 完了を待つ
      await waitFor(() => {
        expect(gachaButton).not.toBeDisabled();
      });
    });
  });

  describe('ポケモン獲得演出', () => {
    it('Given レジェンダリーポケモンを獲得する When 演出が表示される Then 特別な演出が表示される', async () => {
      // Given
      const user = userEvent.setup();
      const legendaryPokemon: Pokemon = {
        id: 150,
        name: 'mewtwo',
        imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
        rarity: Rarity.LEGENDARY
      };

      vi.spyOn(GachaService, 'pull').mockResolvedValue({
        success: true,
        pokemon: legendaryPokemon,
        remainingPoints: 100
      });

      render(
        <UserProvider>
          <GachaView />
        </UserProvider>
      );

      // When
      const gachaButton = screen.getByRole('button', { name: /ガチャを引く/i });
      await user.click(gachaButton);

      // Then
      await waitFor(() => {
        const pokemonDisplay = screen.getByTestId('gacha-result');
        expect(pokemonDisplay).toHaveAttribute('data-rarity', 'legendary');
      });
    });

    it('Given レアポケモンを獲得する When 演出が表示される Then レア演出が表示される', async () => {
      // Given
      const user = userEvent.setup();
      const rarePokemon: Pokemon = {
        id: 6,
        name: 'charizard',
        imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
        rarity: Rarity.RARE
      };

      vi.spyOn(GachaService, 'pull').mockResolvedValue({
        success: true,
        pokemon: rarePokemon,
        remainingPoints: 100
      });

      render(
        <UserProvider>
          <GachaView />
        </UserProvider>
      );

      // When
      const gachaButton = screen.getByRole('button', { name: /ガチャを引く/i });
      await user.click(gachaButton);

      // Then
      await waitFor(() => {
        const pokemonDisplay = screen.getByTestId('gacha-result');
        expect(pokemonDisplay).toHaveAttribute('data-rarity', 'rare');
      });
    });

    it('Given ポケモンを獲得する When 演出が表示される Then レア度が表示される', async () => {
      // Given
      const user = userEvent.setup();
      vi.spyOn(GachaService, 'pull').mockResolvedValue({
        success: true,
        pokemon: mockPokemon,
        remainingPoints: 100
      });

      render(
        <UserProvider>
          <GachaView />
        </UserProvider>
      );

      // When
      const gachaButton = screen.getByRole('button', { name: /ガチャを引く/i });
      await user.click(gachaButton);

      // Then
      await waitFor(() => {
        expect(screen.getByText(/ノーマル/i)).toBeInTheDocument();
      });
    });

    it('Given ポケモンを獲得する When 演出が完了する Then 閉じるボタンが表示される', async () => {
      // Given
      const user = userEvent.setup();
      vi.spyOn(GachaService, 'pull').mockResolvedValue({
        success: true,
        pokemon: mockPokemon,
        remainingPoints: 100
      });

      render(
        <UserProvider>
          <GachaView />
        </UserProvider>
      );

      // When
      const gachaButton = screen.getByRole('button', { name: /ガチャを引く/i });
      await user.click(gachaButton);

      // Then
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /閉じる/i })).toBeInTheDocument();
      });
    });

    it('Given 獲得演出が表示されている When 閉じるボタンをクリックする Then 演出が閉じる', async () => {
      // Given
      const user = userEvent.setup();
      vi.spyOn(GachaService, 'pull').mockResolvedValue({
        success: true,
        pokemon: mockPokemon,
        remainingPoints: 100
      });

      render(
        <UserProvider>
          <GachaView />
        </UserProvider>
      );

      const gachaButton = screen.getByRole('button', { name: /ガチャを引く/i });
      await user.click(gachaButton);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /ポケモンを獲得/i })).toBeInTheDocument();
      });

      // When
      const closeButton = screen.getByRole('button', { name: /閉じる/i });
      await user.click(closeButton);

      // Then
      expect(screen.queryByRole('heading', { name: /ポケモンを獲得/i })).not.toBeInTheDocument();
    });
  });

  describe('PokeAPI 通信エラー時のハンドリング', () => {
    it('Given PokeAPI通信がエラーになる When ガチャを引く Then エラーメッセージが表示される', async () => {
      // Given
      const user = userEvent.setup();
      vi.spyOn(GachaService, 'pull').mockRejectedValue(new Error('Network error'));

      render(
        <UserProvider>
          <GachaView />
        </UserProvider>
      );

      // When
      const gachaButton = screen.getByRole('button', { name: /ガチャを引く/i });
      await user.click(gachaButton);

      // Then
      await waitFor(() => {
        expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument();
      });
    });

    it('Given PokeAPI通信がタイムアウトする When ガチャを引く Then タイムアウトエラーが表示される', async () => {
      // Given
      const user = userEvent.setup();
      vi.spyOn(GachaService, 'pull').mockRejectedValue(new Error('Timeout'));

      render(
        <UserProvider>
          <GachaView />
        </UserProvider>
      );

      // When
      const gachaButton = screen.getByRole('button', { name: /ガチャを引く/i });
      await user.click(gachaButton);

      // Then
      await waitFor(() => {
        expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument();
      });
    });

    it('Given エラーが発生する When エラーメッセージが表示される Then ポイントは減らない', async () => {
      // Given
      const user = userEvent.setup();
      vi.spyOn(GachaService, 'pull').mockRejectedValue(new Error('Network error'));

      render(
        <UserProvider>
          <GachaView />
        </UserProvider>
      );

      // 初期ポイントを確認
      expect(screen.getByText(/200/)).toBeInTheDocument();

      // When
      const gachaButton = screen.getByRole('button', { name: /ガチャを引く/i });
      await user.click(gachaButton);

      // Then
      await waitFor(() => {
        expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument();
      });
      
      // ポイントは変わらない
      expect(screen.getByText(/200/)).toBeInTheDocument();
    });

    it('Given エラーが発生する When エラーメッセージが表示される Then 再試行ボタンが表示される', async () => {
      // Given
      const user = userEvent.setup();
      vi.spyOn(GachaService, 'pull').mockRejectedValue(new Error('Network error'));

      render(
        <UserProvider>
          <GachaView />
        </UserProvider>
      );

      // When
      const gachaButton = screen.getByRole('button', { name: /ガチャを引く/i });
      await user.click(gachaButton);

      // Then
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /再試行/i })).toBeInTheDocument();
      });
    });

    it('Given エラーが表示されている When 再試行ボタンをクリックする Then エラーが消える', async () => {
      // Given
      const user = userEvent.setup();
      vi.spyOn(GachaService, 'pull').mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          success: true,
          pokemon: mockPokemon,
          remainingPoints: 100
        });

      render(
        <UserProvider>
          <GachaView />
        </UserProvider>
      );

      const gachaButton = screen.getByRole('button', { name: /ガチャを引く/i });
      await user.click(gachaButton);

      await waitFor(() => {
        expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument();
      });

      // When
      const retryButton = screen.getByRole('button', { name: /再試行/i });
      await user.click(retryButton);

      // Then
      await waitFor(() => {
        expect(screen.queryByText(/エラーが発生しました/i)).not.toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /ポケモンを獲得/i })).toBeInTheDocument();
      });
    });
  });

  describe('レア度別の表示', () => {
    it('Given コモンポケモンを獲得する When 表示される Then 通常の背景色が適用される', async () => {
      // Given
      const user = userEvent.setup();
      vi.spyOn(GachaService, 'pull').mockResolvedValue({
        success: true,
        pokemon: mockPokemon,
        remainingPoints: 100
      });

      render(
        <UserProvider>
          <GachaView />
        </UserProvider>
      );

      // When
      const gachaButton = screen.getByRole('button', { name: /ガチャを引く/i });
      await user.click(gachaButton);

      // Then
      await waitFor(() => {
        const result = screen.getByTestId('gacha-result');
        expect(result).toHaveClass(/bg-gray/i);
      });
    });

    it('Given レアポケモンを獲得する When 表示される Then レア背景色が適用される', async () => {
      // Given
      const user = userEvent.setup();
      const rarePokemon: Pokemon = {
        id: 6,
        name: 'charizard',
        imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
        rarity: Rarity.RARE
      };

      vi.spyOn(GachaService, 'pull').mockResolvedValue({
        success: true,
        pokemon: rarePokemon,
        remainingPoints: 100
      });

      render(
        <UserProvider>
          <GachaView />
        </UserProvider>
      );

      // When
      const gachaButton = screen.getByRole('button', { name: /ガチャを引く/i });
      await user.click(gachaButton);

      // Then
      await waitFor(() => {
        const result = screen.getByTestId('gacha-result');
        expect(result).toHaveClass(/bg-blue/i);
      });
    });

    it('Given レジェンダリーポケモンを獲得する When 表示される Then レジェンダリー背景色が適用される', async () => {
      // Given
      const user = userEvent.setup();
      const legendaryPokemon: Pokemon = {
        id: 150,
        name: 'mewtwo',
        imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
        rarity: Rarity.LEGENDARY
      };

      vi.spyOn(GachaService, 'pull').mockResolvedValue({
        success: true,
        pokemon: legendaryPokemon,
        remainingPoints: 100
      });

      render(
        <UserProvider>
          <GachaView />
        </UserProvider>
      );

      // When
      const gachaButton = screen.getByRole('button', { name: /ガチャを引く/i });
      await user.click(gachaButton);

      // Then
      await waitFor(() => {
        const result = screen.getByTestId('gacha-result');
        expect(result).toHaveClass(/bg-yellow/i);
      });
    });
  });
});
