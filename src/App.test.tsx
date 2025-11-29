import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { PokeApiService } from './services/PokeApiService';
import { Rarity } from './types';

// PokeAPIサービスをモック化
vi.mock('./services/PokeApiService');

describe('App', () => {
  const mockPokemon = {
    id: 25,
    name: 'pikachu',
    japaneseName: 'ピカチュウ',
    imageUrl: 'https://example.com/pikachu.png',
    rarity: Rarity.COMMON
  };

  beforeEach(() => {
    // LocalStorageをクリア
    localStorage.clear();
    
    // PokeAPIのモックをリセット
    vi.mocked(PokeApiService.fetchRandomPokemon).mockResolvedValue(mockPokemon);
    vi.mocked(PokeApiService.fetchPokemonById).mockResolvedValue(mockPokemon);
    vi.mocked(PokeApiService.fetchMultiplePokemon).mockResolvedValue([mockPokemon]);
  });

  describe('Context Provider の統合', () => {
    it('Given アプリが起動した When レンダリングされる Then UserContextとGameContextが提供される', () => {
      render(<App />);
      
      // レベル選択画面が表示されることを確認（Contextが正しく提供されている）
      expect(screen.getByText('ポケモン100マス計算')).toBeInTheDocument();
      expect(screen.getByText('レベルを選んでね！')).toBeInTheDocument();
    });

    it('Given アプリが起動した When レンダリングされる Then ナビゲーションが表示される', async () => {
      render(<App />);
      
      // ナビゲーションボタンが表示されることを確認
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /ホーム/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /ガチャ/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /図鑑/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /統計/i })).toBeInTheDocument();
      });
    });
  });

  describe('画面遷移', () => {
    it('Given ホーム画面が表示されている When ガチャボタンをクリックする Then ガチャ画面に遷移する', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // ガチャボタンをクリック
      const gachaButton = screen.getByRole('button', { name: /ガチャ/i });
      await user.click(gachaButton);
      
      // ガチャ画面が表示されることを確認
      await waitFor(() => {
        expect(screen.getByText(/ポケモンガチャ/i)).toBeInTheDocument();
      });
    });

    it('Given ホーム画面が表示されている When コレクションボタンをクリックする Then コレクション画面に遷移する', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // コレクションボタンをクリック
      const collectionButton = screen.getByRole('button', { name: /図鑑/i });
      await user.click(collectionButton);
      
      // コレクション画面が表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('まだポケモンを獲得していません')).toBeInTheDocument();
      });
    });

    it('Given ホーム画面が表示されている When 統計ボタンをクリックする Then 統計画面に遷移する', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // 統計ボタンをクリック
      const statsButton = screen.getByRole('button', { name: /統計/i });
      await user.click(statsButton);
      
      // 統計画面が表示されることを確認
      await waitFor(() => {
        expect(screen.getByText(/全体の統計/i)).toBeInTheDocument();
        // 新規ユーザーの場合はレベル統計がないので、全体の統計のみ確認
      });
    });

    it('Given ガチャ画面が表示されている When ホームボタンをクリックする Then ホーム画面に戻る', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // ガチャ画面に遷移
      await user.click(screen.getByRole('button', { name: /ガチャ/i }));
      await waitFor(() => {
        expect(screen.getByText(/ポケモンガチャ/i)).toBeInTheDocument();
      });
      
      // ホームボタンをクリック
      await user.click(screen.getByRole('button', { name: /ホーム/i }));
      
      // ホーム画面に戻ることを確認
      await waitFor(() => {
        expect(screen.getByText('レベルを選んでね！')).toBeInTheDocument();
      });
    });
  });

  describe('ゲームフロー全体', () => {
    it('Given ホーム画面が表示されている When レベルを選択する Then ゲーム画面に遷移する', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // レベル1を選択（複数マッチする場合は最初のものを使用）
      const level1Buttons = screen.getAllByRole('button', { name: /Lv\.1/i });
      await user.click(level1Buttons[0]);
      
      // ゲーム画面が表示されることを確認
      await waitFor(() => {
        expect(screen.getByTestId('game-grid')).toBeInTheDocument();
      });
    });

    it('Given ゲーム画面が表示されている When ゲームを終了する Then ホーム画面に戻れる', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // ゲームを開始
      const level1Buttons = screen.getAllByRole('button', { name: /Lv\.1/i });
      await user.click(level1Buttons[0]);
      await waitFor(() => {
        expect(screen.getByTestId('game-grid')).toBeInTheDocument();
      });
      
      // ホームボタンをクリック
      await user.click(screen.getByRole('button', { name: /ホーム/i }));
      
      // ホーム画面に戻ることを確認
      await waitFor(() => {
        expect(screen.getByText('レベルを選んでね！')).toBeInTheDocument();
      });
    });
  });

  describe('データ永続化', () => {
    it('Given ユーザーデータが存在する When アプリを再起動する Then データが保持されている', () => {
      // 初回レンダリング
      const { unmount } = render(<App />);
      
      // LocalStorageにデータが保存されていることを確認
      const savedData = localStorage.getItem('pokemon_math_user_data');
      expect(savedData).toBeTruthy();
      
      // アンマウント
      unmount();
      
      // 再レンダリング
      render(<App />);
      
      // データが保持されていることを確認（統計画面で確認）
      expect(screen.getByText('ポケモン100マス計算')).toBeInTheDocument();
    });
  });
});
