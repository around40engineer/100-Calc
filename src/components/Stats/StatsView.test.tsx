import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsView } from './StatsView';
import { UserProvider } from '../../contexts/UserContext';
import { StorageService } from '../../services/StorageService';
import { Difficulty } from '../../types';

// StorageServiceをモック化
vi.mock('../../services/StorageService', () => ({
  StorageService: {
    loadUserData: vi.fn(),
    saveUserData: vi.fn()
  }
}));

describe('StatsView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('獲得ポイント数の表示', () => {
    it('Given ユーザーが100ポイント持っている When StatsView が表示される Then 獲得ポイント数が表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.NORMAL]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.HARD]: { bestTime: null, totalPlays: 0, firstClearAchieved: false }
        }
      });

      // When
      render(
        <UserProvider>
          <StatsView />
        </UserProvider>
      );

      // Then
      expect(screen.getByText(/100.*ポイント|100.*pt/i)).toBeInTheDocument();
    });

    it('Given ユーザーが0ポイント When StatsView が表示される Then 0ポイントと表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 0,
        ownedPokemon: [],
        stats: {
          [Difficulty.EASY]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.NORMAL]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.HARD]: { bestTime: null, totalPlays: 0, firstClearAchieved: false }
        }
      });

      // When
      render(
        <UserProvider>
          <StatsView />
        </UserProvider>
      );

      // Then
      expect(screen.getByText(/0.*ポイント|0.*pt/i)).toBeInTheDocument();
    });

    it('Given ユーザーが大量のポイントを持っている When StatsView が表示される Then 正しく表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 9999,
        ownedPokemon: [1, 6, 25, 150],
        stats: {
          [Difficulty.EASY]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.NORMAL]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.HARD]: { bestTime: null, totalPlays: 0, firstClearAchieved: false }
        }
      });

      // When
      render(
        <UserProvider>
          <StatsView />
        </UserProvider>
      );

      // Then
      expect(screen.getByText(/9999|9,999/i)).toBeInTheDocument();
    });
  });

  describe('統計画面のレイアウト', () => {
    it('Given StatsView が表示される When 表示される Then タイトルが表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.NORMAL]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.HARD]: { bestTime: null, totalPlays: 0, firstClearAchieved: false }
        }
      });

      // When
      render(
        <UserProvider>
          <StatsView />
        </UserProvider>
      );

      // Then
      expect(screen.getByRole('heading', { name: /統計/i, level: 1 })).toBeInTheDocument();
    });

    it('Given StatsView が表示される When 表示される Then サマリーカードが表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.NORMAL]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.HARD]: { bestTime: null, totalPlays: 0, firstClearAchieved: false }
        }
      });

      // When
      render(
        <UserProvider>
          <StatsView />
        </UserProvider>
      );

      // Then
      expect(screen.getByTestId('summary-card')).toBeInTheDocument();
    });
  });

  describe('エッジケース', () => {
    it('Given 全ての統計が0または未記録 When StatsView が表示される Then 正しく表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 0,
        ownedPokemon: [],
        stats: {
          [Difficulty.EASY]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.NORMAL]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.HARD]: { bestTime: null, totalPlays: 0, firstClearAchieved: false }
        }
      });

      // When
      render(
        <UserProvider>
          <StatsView />
        </UserProvider>
      );

      // Then
      expect(screen.getByText(/0.*ポイント|0.*pt/i)).toBeInTheDocument();
      const zeroPlays = screen.getAllByText(/0.*回/i);
      expect(zeroPlays.length).toBeGreaterThan(0);
    });
  });

  describe('レベル別統計表示', () => {
    it('Given ユーザーがレベル1をプレイ When StatsView が表示される Then レベル1の統計が表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.NORMAL]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.HARD]: { bestTime: null, totalPlays: 0, firstClearAchieved: false }
        },
        levelStats: {
          1: { level: 1, bestTime: 300, totalPlays: 5, cleared: true, stars: 3 }
        },
        highestUnlockedLevel: 2
      });

      // When
      render(
        <UserProvider>
          <StatsView />
        </UserProvider>
      );

      // Then
      const levelStatsCard = screen.getByTestId('level-stats-card');
      expect(screen.getByText(/レベル 1/i)).toBeInTheDocument();
      expect(screen.getByText(/5.*分.*0.*秒/i)).toBeInTheDocument();
      expect(levelStatsCard).toHaveTextContent(/5.*回/i);
    });

    it('Given ユーザーが複数レベルをプレイ When StatsView が表示される Then 全てのレベル統計が表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 500,
        ownedPokemon: [1, 25],
        stats: {
          [Difficulty.EASY]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.NORMAL]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.HARD]: { bestTime: null, totalPlays: 0, firstClearAchieved: false }
        },
        levelStats: {
          1: { level: 1, bestTime: 300, totalPlays: 5, cleared: true, stars: 3 },
          2: { level: 2, bestTime: 280, totalPlays: 3, cleared: true, stars: 2 },
          3: { level: 3, bestTime: 350, totalPlays: 2, cleared: false, stars: 0 }
        },
        highestUnlockedLevel: 3
      });

      // When
      render(
        <UserProvider>
          <StatsView />
        </UserProvider>
      );

      // Then
      expect(screen.getByText(/レベル 1/i)).toBeInTheDocument();
      expect(screen.getByText(/レベル 2/i)).toBeInTheDocument();
      expect(screen.getByText(/レベル 3/i)).toBeInTheDocument();
    });

    it('Given レベル統計が表示される When 表示される Then ベストタイムが表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.NORMAL]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.HARD]: { bestTime: null, totalPlays: 0, firstClearAchieved: false }
        },
        levelStats: {
          1: { level: 1, bestTime: 125, totalPlays: 3, cleared: true, stars: 2 }
        },
        highestUnlockedLevel: 2
      });

      // When
      render(
        <UserProvider>
          <StatsView />
        </UserProvider>
      );

      // Then
      // 125秒 = 2分5秒
      expect(screen.getByText(/2.*分.*5.*秒/i)).toBeInTheDocument();
    });

    it('Given レベル統計が表示される When 表示される Then プレイ回数が表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.NORMAL]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.HARD]: { bestTime: null, totalPlays: 0, firstClearAchieved: false }
        },
        levelStats: {
          1: { level: 1, bestTime: 300, totalPlays: 10, cleared: true, stars: 3 }
        },
        highestUnlockedLevel: 2
      });

      // When
      render(
        <UserProvider>
          <StatsView />
        </UserProvider>
      );

      // Then
      const levelStatsCard = screen.getByTestId('level-stats-card');
      expect(levelStatsCard).toHaveTextContent(/10.*回/i);
    });

    it('Given レベル統計が表示される When 表示される Then スター数が表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.NORMAL]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.HARD]: { bestTime: null, totalPlays: 0, firstClearAchieved: false }
        },
        levelStats: {
          1: { level: 1, bestTime: 300, totalPlays: 5, cleared: true, stars: 3 }
        },
        highestUnlockedLevel: 2
      });

      // When
      render(
        <UserProvider>
          <StatsView />
        </UserProvider>
      );

      // Then
      const starElements = screen.getAllByText(/⭐⭐⭐/);
      expect(starElements.length).toBeGreaterThan(0);
    });

    it('Given クリア済みレベル When 表示される Then チェックマークが表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.NORMAL]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.HARD]: { bestTime: null, totalPlays: 0, firstClearAchieved: false }
        },
        levelStats: {
          1: { level: 1, bestTime: 300, totalPlays: 5, cleared: true, stars: 3 }
        },
        highestUnlockedLevel: 2
      });

      // When
      render(
        <UserProvider>
          <StatsView />
        </UserProvider>
      );

      // Then
      expect(screen.getByText(/✅.*レベル 1/i)).toBeInTheDocument();
    });

    it('Given レベル統計テーブル When 表示される Then テーブルヘッダーが表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.NORMAL]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.HARD]: { bestTime: null, totalPlays: 0, firstClearAchieved: false }
        },
        levelStats: {
          1: { level: 1, bestTime: 300, totalPlays: 5, cleared: true, stars: 3 }
        },
        highestUnlockedLevel: 2
      });

      // When
      render(
        <UserProvider>
          <StatsView />
        </UserProvider>
      );

      // Then
      const levelStatsCard = screen.getByTestId('level-stats-card');
      expect(levelStatsCard).toBeInTheDocument();
      expect(levelStatsCard).toHaveTextContent(/ベストタイム/i);
      expect(levelStatsCard).toHaveTextContent(/スター/i);
    });

    it('Given 進捗率が表示される When 2/20レベルクリア Then 10%と表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 200,
        ownedPokemon: [1, 25],
        stats: {
          [Difficulty.EASY]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.NORMAL]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.HARD]: { bestTime: null, totalPlays: 0, firstClearAchieved: false }
        },
        levelStats: {
          1: { level: 1, bestTime: 300, totalPlays: 5, cleared: true, stars: 3 },
          2: { level: 2, bestTime: 280, totalPlays: 3, cleared: true, stars: 2 }
        },
        highestUnlockedLevel: 3
      });

      // When
      render(
        <UserProvider>
          <StatsView />
        </UserProvider>
      );

      // Then
      expect(screen.getByText(/10%/i)).toBeInTheDocument();
      expect(screen.getByText(/2\/20.*レベルクリア/i)).toBeInTheDocument();
    });

    it('Given レベル統計がない When StatsView が表示される Then レベル統計カードが表示されない', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 0,
        ownedPokemon: [],
        stats: {
          [Difficulty.EASY]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.NORMAL]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.HARD]: { bestTime: null, totalPlays: 0, firstClearAchieved: false }
        }
      });

      // When
      render(
        <UserProvider>
          <StatsView />
        </UserProvider>
      );

      // Then
      expect(screen.queryByTestId('level-stats-card')).not.toBeInTheDocument();
    });

    it('Given レベル名が表示される When 表示される Then LevelConfigServiceから取得した名前が表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.NORMAL]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.HARD]: { bestTime: null, totalPlays: 0, firstClearAchieved: false }
        },
        levelStats: {
          1: { level: 1, bestTime: 300, totalPlays: 5, cleared: true, stars: 3 }
        },
        highestUnlockedLevel: 2
      });

      // When
      render(
        <UserProvider>
          <StatsView />
        </UserProvider>
      );

      // Then
      // LevelConfigServiceはレベル1に対して「レベル1: 1桁の足し算（くり上がりなし）」を返す
      expect(screen.getByText(/1桁の足し算（くり上がりなし）/i)).toBeInTheDocument();
    });

    it('Given レベル統計テーブル When 表示される Then テーブル形式で表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.NORMAL]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.HARD]: { bestTime: null, totalPlays: 0, firstClearAchieved: false }
        },
        levelStats: {
          1: { level: 1, bestTime: 300, totalPlays: 5, cleared: true, stars: 3 }
        },
        highestUnlockedLevel: 2
      });

      // When
      render(
        <UserProvider>
          <StatsView />
        </UserProvider>
      );

      // Then
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });

    it('Given 合計プレイ回数が表示される When レベル統計がある Then 正しく計算される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 500,
        ownedPokemon: [1, 6, 25],
        stats: {
          [Difficulty.EASY]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.NORMAL]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.HARD]: { bestTime: null, totalPlays: 0, firstClearAchieved: false }
        },
        levelStats: {
          1: { level: 1, bestTime: 300, totalPlays: 10, cleared: true, stars: 3 },
          2: { level: 2, bestTime: 280, totalPlays: 8, cleared: true, stars: 2 },
          3: { level: 3, bestTime: 350, totalPlays: 5, cleared: false, stars: 0 }
        },
        highestUnlockedLevel: 3
      });

      // When
      render(
        <UserProvider>
          <StatsView />
        </UserProvider>
      );

      // Then
      // 10 + 8 + 5 = 23
      expect(screen.getByText(/23.*回/i)).toBeInTheDocument();
    });

    it('Given 60秒未満の記録 When 表示される Then 秒のみで表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.NORMAL]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.HARD]: { bestTime: null, totalPlays: 0, firstClearAchieved: false }
        },
        levelStats: {
          1: { level: 1, bestTime: 45, totalPlays: 1, cleared: true, stars: 3 }
        },
        highestUnlockedLevel: 2
      });

      // When
      render(
        <UserProvider>
          <StatsView />
        </UserProvider>
      );

      // Then
      expect(screen.getByText(/45秒/i)).toBeInTheDocument();
    });

    it('Given 60秒以上の記録 When 表示される Then 分秒形式で表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.NORMAL]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.HARD]: { bestTime: null, totalPlays: 0, firstClearAchieved: false }
        },
        levelStats: {
          1: { level: 1, bestTime: 125, totalPlays: 3, cleared: true, stars: 2 }
        },
        highestUnlockedLevel: 2
      });

      // When
      render(
        <UserProvider>
          <StatsView />
        </UserProvider>
      );

      // Then
      // 125秒 = 2分5秒
      expect(screen.getByText(/2.*分.*5.*秒/i)).toBeInTheDocument();
    });

    it('Given プレイしていないレベル When 表示される Then テーブルに表示されない', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.NORMAL]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.HARD]: { bestTime: null, totalPlays: 0, firstClearAchieved: false }
        },
        levelStats: {
          1: { level: 1, bestTime: 300, totalPlays: 5, cleared: true, stars: 3 },
          2: { level: 2, bestTime: null, totalPlays: 0, cleared: false, stars: 0 }
        },
        highestUnlockedLevel: 3
      });

      // When
      render(
        <UserProvider>
          <StatsView />
        </UserProvider>
      );

      // Then
      expect(screen.getByText(/レベル 1/i)).toBeInTheDocument();
      expect(screen.queryByText(/レベル 2/i)).not.toBeInTheDocument();
    });
  });
});
