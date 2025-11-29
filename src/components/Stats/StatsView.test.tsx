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

  describe('最速記録の表示', () => {
    it('Given ユーザーが簡単モードで記録を持っている When StatsView が表示される Then 最速記録が表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1, 25],
        stats: {
          [Difficulty.EASY]: { bestTime: 120, totalPlays: 5, firstClearAchieved: true },
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
      // 120秒 = 2分0秒
      expect(screen.getByText(/2.*分.*0.*秒/i)).toBeInTheDocument();
    });

    it('Given ユーザーが記録を持っていない When StatsView が表示される Then 未記録と表示される', () => {
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
      const noRecordTexts = screen.getAllByText(/未記録|--/i);
      expect(noRecordTexts.length).toBeGreaterThan(0);
    });

    it('Given ユーザーが全難易度で記録を持っている When StatsView が表示される Then 全ての最速記録が表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 500,
        ownedPokemon: [1, 6, 25],
        stats: {
          [Difficulty.EASY]: { bestTime: 120, totalPlays: 10, firstClearAchieved: true },
          [Difficulty.NORMAL]: { bestTime: 180, totalPlays: 8, firstClearAchieved: true },
          [Difficulty.HARD]: { bestTime: 240, totalPlays: 5, firstClearAchieved: true }
        }
      });

      // When
      render(
        <UserProvider>
          <StatsView />
        </UserProvider>
      );

      // Then
      // 120秒 = 2分0秒, 180秒 = 3分0秒, 240秒 = 4分0秒
      expect(screen.getByText(/2.*分.*0.*秒/i)).toBeInTheDocument();
      expect(screen.getByText(/3.*分.*0.*秒/i)).toBeInTheDocument();
      expect(screen.getByText(/4.*分.*0.*秒/i)).toBeInTheDocument();
    });

    it('Given 最速記録が表示される When 表示される Then 秒単位で表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: { bestTime: 125, totalPlays: 3, firstClearAchieved: true },
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
      // 125秒 = 2分5秒
      expect(screen.getByText(/2.*分.*5.*秒/i)).toBeInTheDocument();
    });

    it('Given 最速記録が60秒以上 When 表示される Then 分秒形式で表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: { bestTime: 125, totalPlays: 3, firstClearAchieved: true },
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
      // 125秒 = 2分5秒
      expect(screen.getByText(/2.*分.*5.*秒|2:05/i)).toBeInTheDocument();
    });
  });

  describe('総プレイ回数の表示', () => {
    it('Given ユーザーが簡単モードを5回プレイ When StatsView が表示される Then 総プレイ回数が表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: { bestTime: 120, totalPlays: 5, firstClearAchieved: true },
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
      const playCountTexts = screen.getAllByText(/5.*回/i);
      expect(playCountTexts.length).toBeGreaterThan(0);
    });

    it('Given ユーザーがプレイしていない When StatsView が表示される Then 0回と表示される', () => {
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
      const zeroPlays = screen.getAllByText(/0.*回/i);
      expect(zeroPlays.length).toBeGreaterThan(0);
    });

    it('Given ユーザーが全難易度でプレイ When StatsView が表示される Then 全ての総プレイ回数が表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 500,
        ownedPokemon: [1, 6, 25],
        stats: {
          [Difficulty.EASY]: { bestTime: 120, totalPlays: 10, firstClearAchieved: true },
          [Difficulty.NORMAL]: { bestTime: 180, totalPlays: 8, firstClearAchieved: true },
          [Difficulty.HARD]: { bestTime: 240, totalPlays: 5, firstClearAchieved: true }
        }
      });

      // When
      render(
        <UserProvider>
          <StatsView />
        </UserProvider>
      );

      // Then
      expect(screen.getByText(/10.*回/i)).toBeInTheDocument();
      expect(screen.getByText(/8.*回/i)).toBeInTheDocument();
      expect(screen.getByText(/5.*回/i)).toBeInTheDocument();
    });

    it('Given 総プレイ回数が表示される When 表示される Then 合計プレイ回数も表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 500,
        ownedPokemon: [1, 6, 25],
        stats: {
          [Difficulty.EASY]: { bestTime: 120, totalPlays: 10, firstClearAchieved: true },
          [Difficulty.NORMAL]: { bestTime: 180, totalPlays: 8, firstClearAchieved: true },
          [Difficulty.HARD]: { bestTime: 240, totalPlays: 5, firstClearAchieved: true }
        }
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
  });

  describe('獲得ポイント数の表示', () => {
    it('Given ユーザーが100ポイント持っている When StatsView が表示される Then 獲得ポイント数が表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: { bestTime: 120, totalPlays: 5, firstClearAchieved: true },
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
          [Difficulty.EASY]: { bestTime: 120, totalPlays: 50, firstClearAchieved: true },
          [Difficulty.NORMAL]: { bestTime: 180, totalPlays: 30, firstClearAchieved: true },
          [Difficulty.HARD]: { bestTime: 240, totalPlays: 20, firstClearAchieved: true }
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

  describe('難易度別の統計表示', () => {
    it('Given StatsView が表示される When 表示される Then 簡単モードの統計が表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: { bestTime: 120, totalPlays: 5, firstClearAchieved: true },
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
      expect(screen.getByText(/簡単|easy/i)).toBeInTheDocument();
    });

    it('Given StatsView が表示される When 表示される Then 普通モードの統計が表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.NORMAL]: { bestTime: 180, totalPlays: 3, firstClearAchieved: true },
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
      expect(screen.getByText(/普通|normal/i)).toBeInTheDocument();
    });

    it('Given StatsView が表示される When 表示される Then 難しいモードの統計が表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.NORMAL]: { bestTime: null, totalPlays: 0, firstClearAchieved: false },
          [Difficulty.HARD]: { bestTime: 240, totalPlays: 2, firstClearAchieved: true }
        }
      });

      // When
      render(
        <UserProvider>
          <StatsView />
        </UserProvider>
      );

      // Then
      expect(screen.getByText(/難しい|hard/i)).toBeInTheDocument();
    });

    it('Given 難易度別統計が表示される When 表示される Then テーブル形式で表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: { bestTime: 120, totalPlays: 5, firstClearAchieved: true },
          [Difficulty.NORMAL]: { bestTime: 180, totalPlays: 3, firstClearAchieved: true },
          [Difficulty.HARD]: { bestTime: 240, totalPlays: 2, firstClearAchieved: true }
        }
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

    it('Given 難易度別統計テーブル When 表示される Then ヘッダー行が表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: { bestTime: 120, totalPlays: 5, firstClearAchieved: true },
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
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      expect(screen.getByText(/ベストタイム/i)).toBeInTheDocument();
      const playCountHeaders = screen.getAllByText(/プレイ回数/i);
      expect(playCountHeaders.length).toBeGreaterThan(0);
    });

    it('Given 難易度別統計テーブル When 表示される Then 3行のデータ行が表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: { bestTime: 120, totalPlays: 5, firstClearAchieved: true },
          [Difficulty.NORMAL]: { bestTime: 180, totalPlays: 3, firstClearAchieved: true },
          [Difficulty.HARD]: { bestTime: 240, totalPlays: 2, firstClearAchieved: true }
        }
      });

      // When
      render(
        <UserProvider>
          <StatsView />
        </UserProvider>
      );

      // Then
      const rows = screen.getAllByRole('row');
      // ヘッダー行 + 3つの難易度行 = 4行
      expect(rows.length).toBe(4);
    });

    it('Given 各難易度の統計 When テーブルに表示される Then 最速記録とプレイ回数が表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: { bestTime: 120, totalPlays: 5, firstClearAchieved: true },
          [Difficulty.NORMAL]: { bestTime: 180, totalPlays: 3, firstClearAchieved: true },
          [Difficulty.HARD]: { bestTime: null, totalPlays: 1, firstClearAchieved: false }
        }
      });

      // When
      render(
        <UserProvider>
          <StatsView />
        </UserProvider>
      );

      // Then
      // 簡単モード: 120秒 = 2分0秒
      expect(screen.getByText(/2.*分.*0.*秒/i)).toBeInTheDocument();
      const fiveTimesTexts = screen.getAllByText(/5.*回/i);
      expect(fiveTimesTexts.length).toBeGreaterThan(0);
      
      // 普通モード: 180秒 = 3分0秒
      expect(screen.getByText(/3.*分.*0.*秒/i)).toBeInTheDocument();
      expect(screen.getByText(/3.*回/i)).toBeInTheDocument();
      
      // 難しいモード
      expect(screen.getByText(/1.*回/i)).toBeInTheDocument();
    });
  });

  describe('統計画面のレイアウト', () => {
    it('Given StatsView が表示される When 表示される Then タイトルが表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: { bestTime: 120, totalPlays: 5, firstClearAchieved: true },
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

    it('Given StatsView が表示される When 表示される Then カード形式で表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: { bestTime: 120, totalPlays: 5, firstClearAchieved: true },
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
      const cards = screen.getAllByTestId('stats-card');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('Given StatsView が表示される When 表示される Then サマリーカードが表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: { bestTime: 120, totalPlays: 5, firstClearAchieved: true },
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

    it('Given StatsView が表示される When 表示される Then 難易度別統計カードが表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: { bestTime: 120, totalPlays: 5, firstClearAchieved: true },
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
      expect(screen.getByTestId('difficulty-stats-card')).toBeInTheDocument();
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

    it('Given 非常に短い記録 When StatsView が表示される Then 正しく表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: { bestTime: 30, totalPlays: 1, firstClearAchieved: true },
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
      expect(screen.getByText(/30.*秒|30.*s/i)).toBeInTheDocument();
    });

    it('Given 非常に長い記録 When StatsView が表示される Then 正しく表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 100,
        ownedPokemon: [1],
        stats: {
          [Difficulty.EASY]: { bestTime: 600, totalPlays: 1, firstClearAchieved: true },
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
      // 600秒 = 10分0秒
      expect(screen.getByText(/10.*分.*0.*秒|10:00/i)).toBeInTheDocument();
    });

    it('Given 非常に多いプレイ回数 When StatsView が表示される Then 正しく表示される', () => {
      // Given
      vi.mocked(StorageService.loadUserData).mockReturnValue({
        points: 10000,
        ownedPokemon: [1, 6, 25],
        stats: {
          [Difficulty.EASY]: { bestTime: 120, totalPlays: 999, firstClearAchieved: true },
          [Difficulty.NORMAL]: { bestTime: 180, totalPlays: 500, firstClearAchieved: true },
          [Difficulty.HARD]: { bestTime: 240, totalPlays: 250, firstClearAchieved: true }
        }
      });

      // When
      render(
        <UserProvider>
          <StatsView />
        </UserProvider>
      );

      // Then
      expect(screen.getByText(/999.*回/i)).toBeInTheDocument();
      expect(screen.getByText(/500.*回/i)).toBeInTheDocument();
      expect(screen.getByText(/250.*回/i)).toBeInTheDocument();
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
      expect(screen.getByText(/足し算入門/i)).toBeInTheDocument();
    });
  });
});
