import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CollectionView } from './CollectionView';
import { UserProvider } from '../../contexts/UserContext';
import { PokeApiService } from '../../services/PokeApiService';
import { StorageService } from '../../services/StorageService';
import { Rarity, type Pokemon } from '../../types';

// StorageServiceをモック化
vi.mock('../../services/StorageService', () => ({
  StorageService: {
    loadUserData: vi.fn(),
    saveUserData: vi.fn()
  }
}));

// PokeApiServiceをモック化
vi.mock('../../services/PokeApiService', () => ({
  PokeApiService: {
    fetchMultiplePokemon: vi.fn()
  }
}));

describe('CollectionView', () => {
  let mockPokemonList: Pokemon[];

  beforeEach(() => {
    vi.clearAllMocks();

    // モックポケモンデータ
    mockPokemonList = [
      {
        id: 1,
        name: 'bulbasaur',
        imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
        rarity: Rarity.COMMON
      },
      {
        id: 6,
        name: 'charizard',
        imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
        rarity: Rarity.RARE
      },
      {
        id: 25,
        name: 'pikachu',
        imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
        rarity: Rarity.COMMON
      },
      {
        id: 150,
        name: 'mewtwo',
        imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
        rarity: Rarity.LEGENDARY
      }
    ];

    // デフォルトのユーザーデータ（ポケモンを所持）
    vi.mocked(StorageService.loadUserData).mockReturnValue({
      points: 200,
      ownedPokemon: [1, 6, 25, 150],
      stats: {
        easy: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
        normal: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
        hard: { bestTime: null, totalPlays: 0, firstClearAchieved: false }
      }
    });

    // PokeApiServiceのモック
    vi.mocked(PokeApiService.fetchMultiplePokemon).mockResolvedValue(mockPokemonList);
  });

  describe('コレクション一覧の表示', () => {
    it('Given ユーザーがポケモンを所持している When CollectionView が表示される Then 所持しているポケモンが表示される', async () => {
      // Given & When
      render(
        <UserProvider>
          <CollectionView />
        </UserProvider>
      );

      // Then
      await waitFor(() => {
        expect(screen.getByText(/bulbasaur/i)).toBeInTheDocument();
        expect(screen.getByText(/charizard/i)).toBeInTheDocument();
        expect(screen.getByText(/pikachu/i)).toBeInTheDocument();
        expect(screen.getByText(/mewtwo/i)).toBeInTheDocument();
      });
    });

    it('Given ユーザーがポケモンを所持している When CollectionView が表示される Then PokeApiService が呼ばれる', async () => {
      // Given & When
      render(
        <UserProvider>
          <CollectionView />
        </UserProvider>
      );

      // Then
      await waitFor(() => {
        expect(PokeApiService.fetchMultiplePokemon).toHaveBeenCalledWith([1, 6, 25, 150]);
      });
    });

    it('Given ユーザーがポケモンを所持していない When CollectionView が表示される Then 空の状態が表示される', async () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 0,
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
          <CollectionView />
        </UserProvider>
      );

      // Then
      await waitFor(() => {
        expect(screen.getByText(/まだポケモンを獲得していません/i)).toBeInTheDocument();
      });
    });

    it('Given ポケモンデータを取得中 When CollectionView が表示される Then ローディング表示がされる', () => {
      // Given
      vi.mocked(PokeApiService.fetchMultiplePokemon).mockImplementation(
        () => new Promise(() => {}) // 永遠に解決しないPromise
      );

      // When
      render(
        <UserProvider>
          <CollectionView />
        </UserProvider>
      );

      // Then
      expect(screen.getByText(/ポケモンを読み込み中/i)).toBeInTheDocument();
    });

    it('Given ポケモンデータ取得が完了 When 表示される Then ローディングが消える', async () => {
      // Given & When
      render(
        <UserProvider>
          <CollectionView />
        </UserProvider>
      );

      // Then
      await waitFor(() => {
        expect(screen.queryByText(/ポケモンを読み込み中/i)).not.toBeInTheDocument();
      });
    });

    it('Given 複数のポケモンを所持 When CollectionView が表示される Then グリッドレイアウトで表示される', async () => {
      // Given & When
      render(
        <UserProvider>
          <CollectionView />
        </UserProvider>
      );

      // Then
      await waitFor(() => {
        const grid = screen.getByTestId('pokemon-grid');
        expect(grid).toBeInTheDocument();
        expect(grid).toHaveClass(/grid/i);
      });
    });
  });

  describe('完成度表示', () => {
    it('Given ユーザーが4匹のポケモンを所持 When CollectionView が表示される Then 完成度が表示される', async () => {
      // Given & When
      render(
        <UserProvider>
          <CollectionView />
        </UserProvider>
      );

      // Then
      await waitFor(() => {
        expect(screen.getByText(/コレクション完成度/i)).toBeInTheDocument();
      });
    });

    it('Given ユーザーが4匹中4匹所持 When 完成度が表示される Then 4/151が表示される', async () => {
      // Given & When
      render(
        <UserProvider>
          <CollectionView />
        </UserProvider>
      );

      // Then
      await waitFor(() => {
        expect(screen.getByText(/4\s*\/\s*151/i)).toBeInTheDocument();
      });
    });

    it('Given ユーザーがポケモンを所持していない When 完成度が表示される Then 空の状態メッセージが表示される', async () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 0,
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
          <CollectionView />
        </UserProvider>
      );

      // Then
      await waitFor(() => {
        expect(screen.getByText(/まだポケモンを獲得していません/i)).toBeInTheDocument();
      });
    });

    it('Given ユーザーが4匹所持 When 完成度が表示される Then パーセンテージが表示される', async () => {
      // Given & When
      render(
        <UserProvider>
          <CollectionView />
        </UserProvider>
      );

      // Then
      await waitFor(() => {
        // 4/151 ≈ 2.65%
        expect(screen.getByText(/2\.6.*%/i)).toBeInTheDocument();
      });
    });

    it('Given 完成度が表示される When 表示される Then プログレスバーが表示される', async () => {
      // Given & When
      render(
        <UserProvider>
          <CollectionView />
        </UserProvider>
      );

      // Then
      await waitFor(() => {
        const progressBar = screen.getByTestId('completion-progress');
        expect(progressBar).toBeInTheDocument();
      });
    });

    it('Given ユーザーが4匹所持 When プログレスバーが表示される Then 正しい幅が設定される', async () => {
      // Given & When
      render(
        <UserProvider>
          <CollectionView />
        </UserProvider>
      );

      // Then
      await waitFor(() => {
        const progressBar = screen.getByTestId('completion-progress');
        // 4/151 ≈ 2.65%
        const width = progressBar.style.width;
        expect(width).toMatch(/2\.6.*%/);
      });
    });
  });

  describe('レア度フィルタリング', () => {
    it('Given フィルターボタンが表示される When CollectionView が表示される Then 全てのレア度フィルターが表示される', async () => {
      // Given & When
      render(
        <UserProvider>
          <CollectionView />
        </UserProvider>
      );

      // Then
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /すべて/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /ノーマル/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^レア$/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /レジェンド/i })).toBeInTheDocument();
      });
    });

    it('Given 初期表示 When フィルターが表示される Then すべてフィルターが選択されている', async () => {
      // Given & When
      render(
        <UserProvider>
          <CollectionView />
        </UserProvider>
      );

      // Then
      await waitFor(() => {
        const allButton = screen.getByRole('button', { name: /すべて/i });
        expect(allButton).toHaveClass(/from-blue/i);
      });
    });

    it('Given すべてフィルターが選択されている When 表示される Then 全てのポケモンが表示される', async () => {
      // Given & When
      render(
        <UserProvider>
          <CollectionView />
        </UserProvider>
      );

      // Then
      await waitFor(() => {
        expect(screen.getByText(/bulbasaur/i)).toBeInTheDocument();
        expect(screen.getByText(/charizard/i)).toBeInTheDocument();
        expect(screen.getByText(/pikachu/i)).toBeInTheDocument();
        expect(screen.getByText(/mewtwo/i)).toBeInTheDocument();
      });
    });

    it('Given すべてフィルターが選択されている When COMMONフィルターをクリックする Then COMMONポケモンのみ表示される', async () => {
      // Given
      const user = userEvent.setup();
      render(
        <UserProvider>
          <CollectionView />
        </UserProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/bulbasaur/i)).toBeInTheDocument();
      });

      // When
      const commonButton = screen.getByRole('button', { name: /ノーマル/i });
      await user.click(commonButton);

      // Then
      expect(screen.getByText(/bulbasaur/i)).toBeInTheDocument();
      expect(screen.getByText(/pikachu/i)).toBeInTheDocument();
      expect(screen.queryByText(/charizard/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/mewtwo/i)).not.toBeInTheDocument();
    });

    it('Given すべてフィルターが選択されている When RAREフィルターをクリックする Then RAREポケモンのみ表示される', async () => {
      // Given
      const user = userEvent.setup();
      render(
        <UserProvider>
          <CollectionView />
        </UserProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/charizard/i)).toBeInTheDocument();
      });

      // When
      const rareButton = screen.getByRole('button', { name: /^レア$/i });
      await user.click(rareButton);

      // Then
      expect(screen.getByText(/charizard/i)).toBeInTheDocument();
      expect(screen.queryByText(/bulbasaur/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/pikachu/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/mewtwo/i)).not.toBeInTheDocument();
    });

    it('Given すべてフィルターが選択されている When LEGENDARYフィルターをクリックする Then LEGENDARYポケモンのみ表示される', async () => {
      // Given
      const user = userEvent.setup();
      render(
        <UserProvider>
          <CollectionView />
        </UserProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/mewtwo/i)).toBeInTheDocument();
      });

      // When
      const legendaryButton = screen.getByRole('button', { name: /レジェンド/i });
      await user.click(legendaryButton);

      // Then
      expect(screen.getByText(/mewtwo/i)).toBeInTheDocument();
      expect(screen.queryByText(/bulbasaur/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/pikachu/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/charizard/i)).not.toBeInTheDocument();
    });

    it('Given COMMONフィルターが選択されている When すべてフィルターをクリックする Then 全てのポケモンが表示される', async () => {
      // Given
      const user = userEvent.setup();
      render(
        <UserProvider>
          <CollectionView />
        </UserProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/bulbasaur/i)).toBeInTheDocument();
      });

      const commonButton = screen.getByRole('button', { name: /ノーマル/i });
      await user.click(commonButton);

      expect(screen.queryByText(/charizard/i)).not.toBeInTheDocument();

      // When
      const allButton = screen.getByRole('button', { name: /すべて/i });
      await user.click(allButton);

      // Then
      expect(screen.getByText(/bulbasaur/i)).toBeInTheDocument();
      expect(screen.getByText(/charizard/i)).toBeInTheDocument();
      expect(screen.getByText(/pikachu/i)).toBeInTheDocument();
      expect(screen.getByText(/mewtwo/i)).toBeInTheDocument();
    });

    it('Given フィルターが選択されている When 選択される Then ボタンの見た目が変わる', async () => {
      // Given
      const user = userEvent.setup();
      render(
        <UserProvider>
          <CollectionView />
        </UserProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/bulbasaur/i)).toBeInTheDocument();
      });

      // When
      const commonButton = screen.getByRole('button', { name: /ノーマル/i });
      await user.click(commonButton);

      // Then
      expect(commonButton).toHaveClass(/from-gray/i);
      const allButton = screen.getByRole('button', { name: /すべて/i });
      expect(allButton).not.toHaveClass(/from-blue/i);
    });
  });

  describe('PokeApiService を使用した複数ポケモン取得', () => {
    it('Given ユーザーが複数のポケモンを所持 When CollectionView が表示される Then fetchMultiplePokemon が呼ばれる', async () => {
      // Given & When
      render(
        <UserProvider>
          <CollectionView />
        </UserProvider>
      );

      // Then
      await waitFor(() => {
        expect(PokeApiService.fetchMultiplePokemon).toHaveBeenCalledTimes(1);
      });
    });

    it('Given ユーザーが所持しているポケモンID When fetchMultiplePokemon が呼ばれる Then 正しいIDリストが渡される', async () => {
      // Given & When
      render(
        <UserProvider>
          <CollectionView />
        </UserProvider>
      );

      // Then
      await waitFor(() => {
        expect(PokeApiService.fetchMultiplePokemon).toHaveBeenCalledWith([1, 6, 25, 150]);
      });
    });

    it('Given PokeApiService がエラーを返す When CollectionView が表示される Then エラーメッセージが表示される', async () => {
      // Given
      vi.mocked(PokeApiService.fetchMultiplePokemon).mockRejectedValue(
        new Error('Network error')
      );

      // When
      render(
        <UserProvider>
          <CollectionView />
        </UserProvider>
      );

      // Then
      await waitFor(() => {
        expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument();
      });
    });

    it('Given PokeApiService がエラーを返す When エラーメッセージが表示される Then 再試行ボタンが表示される', async () => {
      // Given
      vi.mocked(PokeApiService.fetchMultiplePokemon).mockRejectedValue(
        new Error('Network error')
      );

      // When
      render(
        <UserProvider>
          <CollectionView />
        </UserProvider>
      );

      // Then
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /再試行/i })).toBeInTheDocument();
      });
    });

    it('Given エラーが表示されている When 再試行ボタンをクリックする Then 再度データ取得が試みられる', async () => {
      // Given
      const user = userEvent.setup();
      vi.mocked(PokeApiService.fetchMultiplePokemon)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockPokemonList);

      render(
        <UserProvider>
          <CollectionView />
        </UserProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument();
      });

      // When
      const retryButton = screen.getByRole('button', { name: /再試行/i });
      await user.click(retryButton);

      // Then
      await waitFor(() => {
        expect(screen.queryByText(/エラーが発生しました/i)).not.toBeInTheDocument();
        expect(screen.getByText(/bulbasaur/i)).toBeInTheDocument();
      });
    });

    it('Given 取得したポケモンデータ When 表示される Then PokemonCard コンポーネントが使用される', async () => {
      // Given & When
      render(
        <UserProvider>
          <CollectionView />
        </UserProvider>
      );

      // Then
      await waitFor(() => {
        const pokemonCards = screen.getAllByTestId('pokemon-card');
        expect(pokemonCards).toHaveLength(4);
      });
    });
  });

  describe('エッジケース', () => {
    it('Given ユーザーが1匹だけ所持 When CollectionView が表示される Then 正しく表示される', async () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [25],
        stats: {
          easy: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          normal: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          hard: { bestTime: null, totalPlays: 0, firstClearAchieved: false }
        }
      });

      vi.mocked(PokeApiService.fetchMultiplePokemon).mockResolvedValue([mockPokemonList[2]]);

      // When
      render(
        <UserProvider>
          <CollectionView />
        </UserProvider>
      );

      // Then
      await waitFor(() => {
        expect(screen.getByText(/pikachu/i)).toBeInTheDocument();
        expect(screen.getByText(/1\s*\/\s*151/i)).toBeInTheDocument();
      });
    });

    it('Given ユーザーが多数のポケモンを所持 When CollectionView が表示される Then スクロール可能である', async () => {
      // Given
      const manyPokemon = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        name: `pokemon-${i + 1}`,
        imageUrl: `https://example.com/${i + 1}.png`,
        rarity: Rarity.COMMON
      }));

      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 1000,
        ownedPokemon: manyPokemon.map(p => p.id),
        stats: {
          easy: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          normal: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          hard: { bestTime: null, totalPlays: 0, firstClearAchieved: false }
        }
      });

      vi.mocked(PokeApiService.fetchMultiplePokemon).mockResolvedValue(manyPokemon);

      // When
      render(
        <UserProvider>
          <CollectionView />
        </UserProvider>
      );

      // Then
      await waitFor(() => {
        const grid = screen.getByTestId('pokemon-grid');
        expect(grid).toBeInTheDocument();
        const pokemonCards = screen.getAllByTestId('pokemon-card');
        expect(pokemonCards.length).toBeGreaterThan(10);
      });
    });

    it('Given フィルター選択時にポケモンが0匹 When 表示される Then 該当なしメッセージが表示される', async () => {
      // Given
      const user = userEvent.setup();
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1, 25], // COMMONのみ
        stats: {
          easy: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          normal: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          hard: { bestTime: null, totalPlays: 0, firstClearAchieved: false }
        }
      });

      vi.mocked(PokeApiService.fetchMultiplePokemon).mockResolvedValue([
        mockPokemonList[0],
        mockPokemonList[2]
      ]);

      render(
        <UserProvider>
          <CollectionView />
        </UserProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/bulbasaur/i)).toBeInTheDocument();
      });

      // When
      const legendaryButton = screen.getByRole('button', { name: /レジェンド/i });
      await user.click(legendaryButton);

      // Then
      expect(screen.getByText(/該当するポケモンがいません/i)).toBeInTheDocument();
    });
  });
});
