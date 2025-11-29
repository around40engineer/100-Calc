import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { Timer } from './Timer';

describe('Timer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('カウントダウン表示', () => {
    it('Given タイマーが開始される When 初期表示される Then 制限時間が表示される', () => {
      // Given & When
      const timeLimit = 300; // 5分
      render(<Timer timeLimit={timeLimit} onTimeUp={vi.fn()} />);

      // Then
      expect(screen.getByText(/5:00/)).toBeInTheDocument();
    });

    it('Given タイマーが動作中である When 1秒経過する Then 残り時間が1秒減る', async () => {
      // Given
      const timeLimit = 300; // 5分
      render(<Timer timeLimit={timeLimit} onTimeUp={vi.fn()} />);

      // When
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // Then
      expect(screen.getByText(/4:59/)).toBeInTheDocument();
    });

    it('Given タイマーが動作中である When 複数秒経過する Then 残り時間が正しく減る', async () => {
      // Given
      const timeLimit = 300; // 5分
      render(<Timer timeLimit={timeLimit} onTimeUp={vi.fn()} />);

      // When
      await act(async () => {
        vi.advanceTimersByTime(5000); // 5秒経過
      });

      // Then
      expect(screen.getByText(/4:55/)).toBeInTheDocument();
    });

    it('Given タイマーが動作中である When 1分経過する Then 分表示が正しく減る', async () => {
      // Given
      const timeLimit = 300; // 5分
      render(<Timer timeLimit={timeLimit} onTimeUp={vi.fn()} />);

      // When
      await act(async () => {
        vi.advanceTimersByTime(60000); // 1分経過
      });

      // Then
      expect(screen.getByText(/4:00/)).toBeInTheDocument();
    });

    it('Given タイマーが1分未満である When 表示される Then 秒数が2桁で表示される', () => {
      // Given & When
      const timeLimit = 59; // 59秒
      render(<Timer timeLimit={timeLimit} onTimeUp={vi.fn()} />);

      // Then
      expect(screen.getByText(/0:59/)).toBeInTheDocument();
    });

    it('Given タイマーが10秒未満である When 表示される Then 秒数が0埋めで表示される', () => {
      // Given & When
      const timeLimit = 5; // 5秒
      render(<Timer timeLimit={timeLimit} onTimeUp={vi.fn()} />);

      // Then
      expect(screen.getByText(/0:05/)).toBeInTheDocument();
    });
  });

  describe('時間切れ時のイベント発火', () => {
    it('Given タイマーが0秒になる When 時間切れになる Then onTimeUpコールバックが呼ばれる', async () => {
      // Given
      const mockOnTimeUp = vi.fn();
      const timeLimit = 3; // 3秒
      render(<Timer timeLimit={timeLimit} onTimeUp={mockOnTimeUp} />);

      // When
      await act(async () => {
        vi.advanceTimersByTime(3000); // 3秒経過
      });

      // Then
      expect(mockOnTimeUp).toHaveBeenCalledOnce();
    });

    it('Given タイマーが0秒になる When 時間切れになる Then 0:00が表示される', async () => {
      // Given
      const mockOnTimeUp = vi.fn();
      const timeLimit = 1; // 1秒
      render(<Timer timeLimit={timeLimit} onTimeUp={mockOnTimeUp} />);

      // When
      await act(async () => {
        vi.advanceTimersByTime(1000); // 1秒経過
      });

      // Then
      expect(screen.getByText(/0:00/)).toBeInTheDocument();
    });

    it('Given タイマーが時間切れになる When onTimeUpが呼ばれる Then カウントダウンが停止する', async () => {
      // Given
      const mockOnTimeUp = vi.fn();
      const timeLimit = 2; // 2秒
      render(<Timer timeLimit={timeLimit} onTimeUp={mockOnTimeUp} />);

      // When
      await act(async () => {
        vi.advanceTimersByTime(2000); // 2秒経過
      });

      expect(mockOnTimeUp).toHaveBeenCalledOnce();

      // さらに時間を進める
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      // Then - onTimeUpは1回だけ呼ばれる
      expect(mockOnTimeUp).toHaveBeenCalledOnce();
      expect(screen.getByText(/0:00/)).toBeInTheDocument();
    });
  });

  describe('残り時間が少ない時の警告表示', () => {
    it('Given 残り時間が30秒以下である When 表示される Then 警告スタイルが適用される', () => {
      // Given & When
      const timeLimit = 30; // 30秒
      render(<Timer timeLimit={timeLimit} onTimeUp={vi.fn()} />);

      // Then
      const timerElement = screen.getByTestId('timer');
      expect(timerElement).toHaveClass('text-red-600');
    });

    it('Given 残り時間が30秒より多い When 表示される Then 通常スタイルが適用される', () => {
      // Given & When
      const timeLimit = 31; // 31秒
      render(<Timer timeLimit={timeLimit} onTimeUp={vi.fn()} />);

      // Then
      const timerElement = screen.getByTestId('timer');
      expect(timerElement).not.toHaveClass('text-red-600');
    });

    it('Given 残り時間が31秒である When 1秒経過して30秒になる Then 警告スタイルに変わる', async () => {
      // Given
      const timeLimit = 31; // 31秒
      render(<Timer timeLimit={timeLimit} onTimeUp={vi.fn()} />);

      const timerElement = screen.getByTestId('timer');
      expect(timerElement).not.toHaveClass('text-red-600');

      // When
      await act(async () => {
        vi.advanceTimersByTime(1000); // 1秒経過
      });

      // Then
      expect(timerElement).toHaveClass('text-red-600');
    });

    it('Given 残り時間が10秒以下である When 表示される Then より強い警告スタイルが適用される', () => {
      // Given & When
      const timeLimit = 10; // 10秒
      render(<Timer timeLimit={timeLimit} onTimeUp={vi.fn()} />);

      // Then
      const timerElement = screen.getByTestId('timer');
      expect(timerElement).toHaveClass('text-red-600');
      expect(timerElement).toHaveClass('font-bold');
    });

    it('Given 残り時間が10秒より多い When 表示される Then 強調スタイルは適用されない', () => {
      // Given & When
      const timeLimit = 11; // 11秒
      render(<Timer timeLimit={timeLimit} onTimeUp={vi.fn()} />);

      // Then
      const timerElement = screen.getByTestId('timer');
      expect(timerElement).not.toHaveClass('font-bold');
    });
  });

  describe('タイマーのクリーンアップ', () => {
    it('Given タイマーが動作中である When コンポーネントがアンマウントされる Then タイマーがクリアされる', () => {
      // Given
      const mockOnTimeUp = vi.fn();
      const { unmount } = render(<Timer timeLimit={60} onTimeUp={mockOnTimeUp} />);

      // When
      unmount();
      vi.advanceTimersByTime(60000);

      // Then - アンマウント後はコールバックが呼ばれない
      expect(mockOnTimeUp).not.toHaveBeenCalled();
    });
  });
});
