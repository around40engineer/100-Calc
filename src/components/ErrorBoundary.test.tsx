import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from './ErrorBoundary';

// エラーをスローするテストコンポーネント
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>正常なコンポーネント</div>;
}

// PokeAPIエラーをシミュレートするコンポーネント
function ThrowPokeApiError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Failed to fetch pokemon');
  }
  return <div>正常なコンポーネント</div>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // コンソールエラーを抑制（エラーバウンダリーのテストで期待されるエラー）
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('エラーキャッチの動作', () => {
    it('Given 子コンポーネントがエラーをスローする When レンダリングされる Then エラーがキャッチされる', () => {
      // Given & When
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Then
      expect(screen.queryByText('正常なコンポーネント')).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /エラーが発生しました/i })).toBeInTheDocument();
    });

    it('Given 子コンポーネントが正常である When レンダリングされる Then 子コンポーネントが表示される', () => {
      // Given & When
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Then
      expect(screen.getByText('正常なコンポーネント')).toBeInTheDocument();
      expect(screen.queryByText(/エラーが発生しました/i)).not.toBeInTheDocument();
    });

    it('Given 複数の子コンポーネントがある When 1つがエラーをスローする Then エラー画面が表示される', () => {
      // Given & When
      render(
        <ErrorBoundary>
          <div>正常なコンポーネント1</div>
          <ThrowError shouldThrow={true} />
          <div>正常なコンポーネント2</div>
        </ErrorBoundary>
      );

      // Then
      expect(screen.queryByText('正常なコンポーネント1')).not.toBeInTheDocument();
      expect(screen.queryByText('正常なコンポーネント2')).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /エラーが発生しました/i })).toBeInTheDocument();
    });
  });

  describe('エラー画面の表示', () => {
    it('Given エラーが発生する When エラー画面が表示される Then エラーメッセージが表示される', () => {
      // Given & When
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Then
      expect(screen.getByRole('heading', { name: /エラーが発生しました/i })).toBeInTheDocument();
      expect(screen.getByText(/問題が発生しました/i)).toBeInTheDocument();
    });

    it('Given エラーが発生する When エラー画面が表示される Then リロードボタンが表示される', () => {
      // Given & When
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Then
      expect(screen.getByRole('button', { name: /もう一度試す/i })).toBeInTheDocument();
    });

    it('Given エラー画面が表示される When リロードボタンをクリックする Then ページがリロードされる', async () => {
      // Given
      const user = userEvent.setup();
      const reloadMock = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadMock },
        writable: true
      });

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // When
      const reloadButton = screen.getByRole('button', { name: /もう一度試す/i });
      await user.click(reloadButton);

      // Then
      expect(reloadMock).toHaveBeenCalledOnce();
    });
  });

  describe('PokeAPIエラー時の表示', () => {
    it('Given PokeAPIエラーが発生する When エラーメッセージを確認する Then PokeAPI関連のエラーメッセージが表示される', () => {
      // Given & When
      render(
        <ErrorBoundary>
          <ThrowPokeApiError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Then
      expect(screen.getByRole('heading', { name: /エラーが発生しました/i })).toBeInTheDocument();
      expect(screen.getByText(/ポケモンの読み込みに失敗しました/i)).toBeInTheDocument();
    });

    it('Given PokeAPIエラーが発生する When エラー画面が表示される Then ネットワーク接続の確認を促すメッセージが表示される', () => {
      // Given & When
      render(
        <ErrorBoundary>
          <ThrowPokeApiError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Then
      expect(screen.getByText(/インターネット接続を確認してください/i)).toBeInTheDocument();
    });

    it('Given PokeAPIエラーが発生する When エラー画面が表示される Then リトライボタンが表示される', () => {
      // Given & When
      render(
        <ErrorBoundary>
          <ThrowPokeApiError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Then
      expect(screen.getByRole('button', { name: /もう一度試す/i })).toBeInTheDocument();
    });
  });

  describe('エラー情報の記録', () => {
    it('Given エラーが発生する When エラーがキャッチされる Then コンソールにエラーが記録される', () => {
      // Given
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // When
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Then
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
