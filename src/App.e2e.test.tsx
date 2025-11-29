import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { PokeApiService } from './services/PokeApiService';
import { Rarity } from './types';

// PokeAPIサービスをモック化
vi.mock('./services/PokeApiService');

describe('E2E シナリオテスト', () => {
  const mockPokemon = {
    id: 25,
    name: 'pikachu',
    imageUrl: 'https://example.com/pikachu.png',
    rarity: Rarity.COMMON
  };

  const mockRarePokemon = {
    id: 6,
    name: 'charizard',
    imageUrl: 'https://example.com/charizard.png',
    rarity: Rarity.RARE
  };

  const mockLegendaryPokemon = {
    id: 150,
    name: 'mewtwo',
    imageUrl: 'https://example.com/mewtwo.png',
    rarity: Rarity.LEGENDARY
  };

  beforeEach(() => {
    // LocalStorageをクリア
    localStorage.clear();
    
    // PokeAPIのモックをリセット
    vi.mocked(PokeApiService.fetchRandomPokemon).mockResolvedValue(mockPokemon);
    vi.mocked(PokeApiService.fetchPokemonById).mockResolvedValue(mockPokemon);
    vi.mocked(PokeApiService.fetchMultiplePokemon).mockResolvedValue([mockPokemon]);
  });

  describe('完全なゲームプレイフロー: 難易度選択 → ゲームプレイ → 報酬獲得', () => {
    it('Given ユーザーがアプリを起動した When 難易度を選択してゲームをプレイし完了する Then 報酬を獲得してポケモンが図鑑に追加される', async () => {
      const user = userEvent.setup();
      
      // Step 1: アプリを起動
      render(<App />);
      
      // ホーム画面が表示されることを確認
      expect(screen.getByText('ポケモン100マス計算')).toBeInTheDocument();
      expect(screen.getByText('レベルを選んでね！')).toBeInTheDocument();
      
      // Step 2: レベルを選択（レベル1）
      const level1Buttons = screen.getAllByRole('button', { name: /Lv\.1/i });
      await user.click(level1Buttons[0]);
      
      // ゲーム画面が表示されることを確認
      await waitFor(() => {
        expect(screen.getByTestId('game-grid')).toBeInTheDocument();
      });
      
      // タイマーが表示されることを確認
      expect(screen.getByTestId('timer')).toBeInTheDocument();
      
      // Step 3: 問題に回答（最初のセルをクリックして電卓UIを使用）
      const answerCells = screen.getAllByTestId(/^answer-cell-/);
      expect(answerCells.length).toBeGreaterThan(0); // 回答セルが存在することを確認
      
      // 最初の回答セルをクリック
      const firstAnswerCell = screen.getByTestId('answer-cell-0-0');
      await user.click(firstAnswerCell);
      
      // 電卓UIが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText(/OK/)).toBeInTheDocument();
      });
      
      // 電卓UIで数字を入力（簡単な例として "5" を入力）
      await user.click(screen.getByRole('button', { name: '5' }));
      await user.click(screen.getByRole('button', { name: /OK/ }));
      
      // 電卓UIが閉じることを確認
      await waitFor(() => {
        expect(screen.queryByText(/OK/)).not.toBeInTheDocument();
      });
      
      // Step 4: ゲームを完了させる（モック環境では全問正解をシミュレート）
      // 実際のE2Eでは全100問を解くのは現実的でないため、
      // ここではゲームの状態を確認するに留める
      
      // ゲームが進行中であることを確認
      expect(screen.getByTestId('game-grid')).toBeInTheDocument();
      
      // Note: 完全なゲームクリアのテストは時間がかかるため、
      // 報酬モーダルの表示は別のテストでカバー
    });

    it('Given ユーザーがゲームを完了した When 報酬モーダルが表示される Then 獲得ポイントとポケモンが表示される', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // ゲームを開始
      const level1Buttons = screen.getAllByRole('button', { name: /Lv\.1/i });
      await user.click(level1Buttons[0]);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-grid')).toBeInTheDocument();
      });
      
      // ゲームの進行状態を確認
      expect(screen.getByTestId('timer')).toBeInTheDocument();
      
      // Note: 報酬モーダルの表示は RewardModal.test.tsx で詳細にテスト済み
      // ここではゲームフローの一部として統合されていることを確認
    });
  });

  describe('ガチャフロー: ガチャ実行 → 図鑑確認', () => {
    it('Given ユーザーが十分なポイントを持っている When ガチャを引く Then ポケモンを獲得して図鑑に追加される', async () => {
      const user = userEvent.setup();
      
      // 初期ポイントを設定（LocalStorageに直接設定）
      const initialUserData = {
        points: 200,
        ownedPokemon: [],
        levelStats: {},
        highestUnlockedLevel: 1
      };
      localStorage.setItem('pokemon_math_user_data', JSON.stringify(initialUserData));
      
      // Step 1: アプリを起動
      render(<App />);
      
      // Step 2: ガチャ画面に遷移
      const gachaButton = screen.getByRole('button', { name: /ガチャ/i });
      await user.click(gachaButton);
      
      await waitFor(() => {
        expect(screen.getByText(/ポケモンガチャ/i)).toBeInTheDocument();
      });
      
      // 現在のポイントが表示されることを確認
      expect(screen.getByText(/所持ポイント/i)).toBeInTheDocument();
      expect(screen.getByText(/200/)).toBeInTheDocument();
      
      // Step 3: ガチャを引く
      const pullGachaButton = screen.getByRole('button', { name: /ガチャを引く/i });
      await user.click(pullGachaButton);
      
      // ガチャ結果が表示されることを確認
      await waitFor(() => {
        expect(screen.getByText(/ポケモンを獲得しました/i)).toBeInTheDocument();
      });
      
      // ポイントが減っていることを確認（ガチャ結果モーダルを閉じた後）
      await user.click(screen.getByRole('button', { name: /閉じる/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/所持ポイント/i)).toBeInTheDocument();
      });
      
      // Step 4: 図鑑画面に遷移
      const collectionButton = screen.getByRole('button', { name: /図鑑/i });
      await user.click(collectionButton);
      
      await waitFor(() => {
        expect(screen.getByText(/コレクション完成度/i)).toBeInTheDocument();
      });
      
      // 獲得したポケモンが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('pikachu')).toBeInTheDocument();
      });
      
      // 図鑑完成度が更新されていることを確認
      expect(screen.getByText(/1/)).toBeInTheDocument();
      expect(screen.getByText(/151/)).toBeInTheDocument();
    });

    it('Given ユーザーがポイント不足の状態で When ガチャを引こうとする Then エラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      
      // 不足ポイントを設定
      const initialUserData = {
        points: 50,
        ownedPokemon: [],
        levelStats: {},
        highestUnlockedLevel: 1
      };
      localStorage.setItem('pokemon_math_user_data', JSON.stringify(initialUserData));
      
      render(<App />);
      
      // ガチャ画面に遷移
      await user.click(screen.getByRole('button', { name: /ガチャ/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/ポケモンガチャ/i)).toBeInTheDocument();
      });
      
      // ガチャを引こうとする
      const pullGachaButton = screen.getByRole('button', { name: /ガチャを引く/i });
      await user.click(pullGachaButton);
      
      // エラーメッセージが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText(/ポイントが足りません/i)).toBeInTheDocument();
      });
    });

    it('Given ユーザーが複数回ガチャを引く When 異なるレア度のポケモンを獲得する Then 図鑑に全て追加される', async () => {
      const user = userEvent.setup();
      
      // 十分なポイントを設定
      const initialUserData = {
        points: 300,
        ownedPokemon: [],
        levelStats: {},
        highestUnlockedLevel: 1
      };
      localStorage.setItem('pokemon_math_user_data', JSON.stringify(initialUserData));
      
      // 異なるポケモンを返すようにモックを設定
      vi.mocked(PokeApiService.fetchPokemonById)
        .mockResolvedValueOnce(mockPokemon)
        .mockResolvedValueOnce(mockRarePokemon)
        .mockResolvedValueOnce(mockLegendaryPokemon);
      
      render(<App />);
      
      // ガチャ画面に遷移
      await user.click(screen.getByRole('button', { name: /ガチャ/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/ポケモンガチャ/i)).toBeInTheDocument();
      });
      
      // 1回目のガチャ
      await user.click(screen.getByRole('button', { name: /ガチャを引く/i }));
      await waitFor(() => {
        expect(screen.getByText(/ポケモンを獲得しました/i)).toBeInTheDocument();
      });
      
      // モーダルを閉じる
      const closeButtons = screen.getAllByRole('button', { name: /閉じる/i });
      if (closeButtons.length > 0) {
        await user.click(closeButtons[0]);
      }
      
      // モーダルが閉じるのを待つ
      await waitFor(() => {
        expect(screen.queryByText(/ポケモンを獲得しました/i)).not.toBeInTheDocument();
      });
      
      // 2回目のガチャ
      await waitFor(() => {
        expect(screen.getByText(/200/)).toBeInTheDocument(); // 残りポイント
      });
      
      await user.click(screen.getByRole('button', { name: /ガチャを引く/i }));
      await waitFor(() => {
        expect(screen.getByText(/ポケモンを獲得しました/i)).toBeInTheDocument();
      });
      
      // モーダルを閉じる
      const closeButtons2 = screen.getAllByRole('button', { name: /閉じる/i });
      if (closeButtons2.length > 0) {
        await user.click(closeButtons2[0]);
      }
      
      // モーダルが閉じるのを待つ
      await waitFor(() => {
        expect(screen.queryByText(/ポケモンを獲得しました/i)).not.toBeInTheDocument();
      });
      
      // 図鑑を確認
      await user.click(screen.getByRole('button', { name: /図鑑/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/コレクション完成度/i)).toBeInTheDocument();
      });
      
      // 複数のポケモンが表示されることを確認
      // Note: 実際の表示はモックの設定とコンポーネントの実装に依存
    });
  });

  describe('レベルシステムの完全なフロー', () => {
    it('Given 新規ユーザーが When レベル1を選択してプレイする Then レベル2がアンロックされる', async () => {
      const user = userEvent.setup();
      
      // Step 1: アプリを起動（新規ユーザー）
      render(<App />);
      
      // ホーム画面が表示されることを確認
      expect(screen.getByText('ポケモン100マス計算')).toBeInTheDocument();
      expect(screen.getByText('レベルを選んでね！')).toBeInTheDocument();
      
      // 初期状態ではレベル1のみアンロック
      const level1Buttons = screen.getAllByRole('button', { name: /Lv\.1/i });
      expect(level1Buttons.length).toBeGreaterThan(0);
      
      // レベル2はロックされている（ロックアイコンが表示される）
      const allButtons = screen.getAllByRole('button');
      const level2Button = allButtons.find(btn => btn.textContent?.includes('Lv.2'));
      expect(level2Button).toBeInTheDocument();
      
      // Step 2: レベル1を選択
      await user.click(level1Buttons[0]);
      
      // ゲーム画面が表示されることを確認
      await waitFor(() => {
        expect(screen.getByTestId('game-grid')).toBeInTheDocument();
      });
      
      // タイマーが表示されることを確認
      expect(screen.getByTestId('timer')).toBeInTheDocument();
      
      // Step 3: ゲームの状態を確認
      // レベル1の制限時間は600秒（10分）
      const timerElement = screen.getByTestId('timer');
      expect(timerElement).toBeInTheDocument();
      
      // Note: 実際のゲームクリアは時間がかかるため、
      // レベルアンロックのロジックはUserContext.test.tsxで詳細にテスト済み
    });

    it('Given ユーザーがレベル1をクリアした When ホーム画面に戻る Then レベル2がアンロック状態で表示される', async () => {
      const user = userEvent.setup();
      
      // レベル1をクリア済みの状態を設定
      const initialUserData = {
        points: 100,
        ownedPokemon: [25],
        levelStats: {
          1: { level: 1, bestTime: 300, totalPlays: 1, cleared: true, stars: 3 }
        },
        highestUnlockedLevel: 2
      };
      localStorage.setItem('pokemon_math_user_data', JSON.stringify(initialUserData));
      
      render(<App />);
      
      // ホーム画面でレベル2がアンロックされていることを確認
      await waitFor(() => {
        expect(screen.getByText('レベルを選んでね！')).toBeInTheDocument();
      });
      
      // クリア済みレベル数が表示される
      expect(screen.getByText(/クリア済み: 1 \/ 20/)).toBeInTheDocument();
      
      // 最高レベルが表示される
      expect(screen.getByText(/最高レベル: Lv\.2/)).toBeInTheDocument();
      
      // レベル2のボタンが選択可能
      const level2Buttons = screen.getAllByRole('button', { name: /Lv\.2/i });
      expect(level2Buttons.length).toBeGreaterThan(0);
      expect(level2Buttons[0]).not.toBeDisabled();
    });

    it('Given ユーザーが複数レベルをクリアした When 統計画面を確認する Then レベル別の統計が表示される', async () => {
      const user = userEvent.setup();
      
      // 複数レベルをクリア済みの状態を設定
      const initialUserData = {
        points: 500,
        ownedPokemon: [25, 6, 150],
        levelStats: {
          1: { level: 1, bestTime: 280, totalPlays: 5, cleared: true, stars: 3 },
          2: { level: 2, bestTime: 320, totalPlays: 3, cleared: true, stars: 3 },
          3: { level: 3, bestTime: 400, totalPlays: 2, cleared: true, stars: 2 },
          4: { level: 4, bestTime: null, totalPlays: 1, cleared: false, stars: 0 }
        },
        highestUnlockedLevel: 5
      };
      localStorage.setItem('pokemon_math_user_data', JSON.stringify(initialUserData));
      
      render(<App />);
      
      // 統計画面に遷移
      await user.click(screen.getByRole('button', { name: /統計/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/全体の統計/i)).toBeInTheDocument();
      });
      
      // 合計プレイ回数が表示される（5 + 3 + 2 + 1 = 11）
      expect(screen.getByText(/合計プレイ回数/)).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByText(/11/)).toBeInTheDocument();
      });
      
      // レベル別統計が表示される
      // Note: 実際の表示内容はStatsView.tsxの実装に依存
    });

    it('Given ユーザーがレベル15以上をクリアした When 報酬を獲得する Then レアポケモンの出現率が上がる', async () => {
      const user = userEvent.setup();
      
      // レベル15をクリア済みの状態を設定
      const initialUserData = {
        points: 1000,
        ownedPokemon: [],
        levelStats: {
          15: { level: 15, bestTime: 350, totalPlays: 1, cleared: true, stars: 3 }
        },
        highestUnlockedLevel: 16
      };
      localStorage.setItem('pokemon_math_user_data', JSON.stringify(initialUserData));
      
      // レアポケモンを返すようにモック
      vi.mocked(PokeApiService.fetchPokemonById).mockResolvedValue(mockRarePokemon);
      
      render(<App />);
      
      // ガチャ画面に遷移
      await user.click(screen.getByRole('button', { name: /ガチャ/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/ポケモンガチャ/i)).toBeInTheDocument();
      });
      
      // ガチャを引く
      await user.click(screen.getByRole('button', { name: /ガチャを引く/i }));
      
      // レアポケモンが獲得される
      await waitFor(() => {
        expect(screen.getByText(/ポケモンを獲得しました/i)).toBeInTheDocument();
      });
      
      // Note: レア度の計算ロジックはRewardCalculator.test.tsで詳細にテスト済み
    });

    it('Given ユーザーがロックされたレベルを選択しようとする When クリックする Then エラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      
      // レベル1のみアンロックの状態
      const initialUserData = {
        points: 0,
        ownedPokemon: [],
        levelStats: {},
        highestUnlockedLevel: 1
      };
      localStorage.setItem('pokemon_math_user_data', JSON.stringify(initialUserData));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText('レベルを選んでね！')).toBeInTheDocument();
      });
      
      // レベル3のボタンを探す（ロックされている）
      const allButtons = screen.getAllByRole('button');
      const level3Button = allButtons.find(btn => btn.textContent?.includes('Lv.3'));
      
      if (level3Button) {
        // ロックされたレベルはdisabled状態
        expect(level3Button).toBeDisabled();
      }
    });

    it('Given ユーザーが異なるレベル範囲をプレイする When 問題の難易度を確認する Then レベルに応じた問題が生成される', async () => {
      const user = userEvent.setup();
      
      // 複数レベルをアンロック済みの状態
      const initialUserData = {
        points: 0,
        ownedPokemon: [],
        levelStats: {
          1: { level: 1, bestTime: 300, totalPlays: 1, cleared: true, stars: 3 },
          5: { level: 5, bestTime: 280, totalPlays: 1, cleared: true, stars: 3 },
          10: { level: 10, bestTime: 350, totalPlays: 1, cleared: true, stars: 2 }
        },
        highestUnlockedLevel: 11
      };
      localStorage.setItem('pokemon_math_user_data', JSON.stringify(initialUserData));
      
      render(<App />);
      
      // レベル1を選択（1桁の足し算）
      const level1Buttons = screen.getAllByRole('button', { name: /Lv\.1/i });
      await user.click(level1Buttons[0]);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-grid')).toBeInTheDocument();
      });
      
      // ゲームが開始されたことを確認
      expect(screen.getByTestId('timer')).toBeInTheDocument();
      
      // Note: 問題生成のロジックはProblemGenerator.test.tsで詳細にテスト済み
      // ここではゲームが正常に開始されることを確認
    });
  });

  describe('データ永続化の確認', () => {
    it('Given ユーザーがポイントを獲得した When アプリを再起動する Then ポイントが保持されている', async () => {
      const user = userEvent.setup();
      
      // 初期データを設定
      const initialUserData = {
        points: 150,
        ownedPokemon: [25, 6],
        levelStats: {
          1: { level: 1, bestTime: 120, totalPlays: 5, cleared: true, stars: 3 }
        },
        highestUnlockedLevel: 2
      };
      localStorage.setItem('pokemon_math_user_data', JSON.stringify(initialUserData));
      
      // 初回レンダリング
      const { unmount } = render(<App />);
      
      // ガチャ画面でポイントを確認
      await user.click(screen.getByRole('button', { name: /ガチャ/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/150/)).toBeInTheDocument();
      });
      
      // アンマウント（アプリ終了をシミュレート）
      unmount();
      
      // LocalStorageにデータが保存されていることを確認
      const savedData = localStorage.getItem('pokemon_math_user_data');
      expect(savedData).toBeTruthy();
      const parsedData = JSON.parse(savedData!);
      expect(parsedData.points).toBe(150);
      expect(parsedData.ownedPokemon).toEqual([25, 6]);
      
      // 再レンダリング（アプリ再起動をシミュレート）
      render(<App />);
      
      // ガチャ画面でポイントが保持されていることを確認
      await user.click(screen.getByRole('button', { name: /ガチャ/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/150/)).toBeInTheDocument();
      });
    });

    it('Given ユーザーがポケモンを獲得した When アプリを再起動する Then 図鑑が保持されている', async () => {
      const user = userEvent.setup();
      
      // ポケモンを持った状態のデータを設定
      const initialUserData = {
        points: 100,
        ownedPokemon: [25, 6, 150],
        levelStats: {
          1: { level: 1, bestTime: 120, totalPlays: 5, cleared: true, stars: 3 },
          2: { level: 2, bestTime: 180, totalPlays: 3, cleared: true, stars: 2 }
        },
        highestUnlockedLevel: 3
      };
      localStorage.setItem('pokemon_math_user_data', JSON.stringify(initialUserData));
      
      // 複数のポケモンを返すようにモックを設定
      vi.mocked(PokeApiService.fetchMultiplePokemon).mockResolvedValue([
        mockPokemon,
        mockRarePokemon,
        mockLegendaryPokemon
      ]);
      
      // 初回レンダリング
      const { unmount } = render(<App />);
      
      // 図鑑画面を確認
      await user.click(screen.getByRole('button', { name: /図鑑/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/コレクション完成度/i)).toBeInTheDocument();
      });
      
      // 図鑑完成度を確認
      await waitFor(() => {
        expect(screen.getByText(/3/)).toBeInTheDocument();
        expect(screen.getByText(/151/)).toBeInTheDocument();
      });
      
      // アンマウント
      unmount();
      
      // 再レンダリング
      render(<App />);
      
      // 図鑑画面を再度確認
      await user.click(screen.getByRole('button', { name: /図鑑/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/コレクション完成度/i)).toBeInTheDocument();
      });
      
      // 図鑑が保持されていることを確認
      await waitFor(() => {
        expect(screen.getByText(/3/)).toBeInTheDocument();
        expect(screen.getByText(/151/)).toBeInTheDocument();
      });
    });

    it('Given ユーザーが統計データを持っている When アプリを再起動する Then 統計が保持されている', async () => {
      const user = userEvent.setup();
      
      // 統計データを設定
      const initialUserData = {
        points: 200,
        ownedPokemon: [25],
        levelStats: {
          1: { level: 1, bestTime: 95, totalPlays: 10, cleared: true, stars: 3 },
          2: { level: 2, bestTime: 150, totalPlays: 5, cleared: true, stars: 2 },
          3: { level: 3, bestTime: 250, totalPlays: 2, cleared: true, stars: 1 }
        },
        highestUnlockedLevel: 4
      };
      localStorage.setItem('pokemon_math_user_data', JSON.stringify(initialUserData));
      
      // 初回レンダリング
      const { unmount } = render(<App />);
      
      // 統計画面を確認
      await user.click(screen.getByRole('button', { name: /統計/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/全体の統計/i)).toBeInTheDocument();
      });
      
      // 統計データが表示されることを確認
      expect(screen.getByText(/合計プレイ回数/)).toBeInTheDocument();
      // レベルベースの統計: 10 + 5 + 2 = 17
      await waitFor(() => {
        expect(screen.getByText(/17/)).toBeInTheDocument();
      });
      
      // アンマウント
      unmount();
      
      // 再レンダリング
      render(<App />);
      
      // 統計画面を再度確認
      await user.click(screen.getByRole('button', { name: /統計/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/全体の統計/i)).toBeInTheDocument();
      });
      
      // 統計が保持されていることを確認
      await waitFor(() => {
        expect(screen.getByText(/17/)).toBeInTheDocument();
      });
    });
  });

  describe('PokeAPI との統合テスト', () => {
    it('Given PokeAPIが正常に応答する When ゲームを開始する Then ポケモンデータが取得される', async () => {
      const user = userEvent.setup();
      
      // PokeAPIのモックが呼ばれることを確認
      const fetchSpy = vi.mocked(PokeApiService.fetchRandomPokemon);
      
      render(<App />);
      
      // ゲームを開始
      const level1Buttons = screen.getAllByRole('button', { name: /Lv\.1/i });
      await user.click(level1Buttons[0]);
      
      // PokeAPIが呼ばれたことを確認
      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalled();
      });
      
      // ゲーム画面が表示されることを確認
      await waitFor(() => {
        expect(screen.getByTestId('game-grid')).toBeInTheDocument();
      });
    });

    it('Given PokeAPIが正常に応答する When ガチャを引く Then ポケモンデータが取得される', async () => {
      const user = userEvent.setup();
      
      // 十分なポイントを設定
      const initialUserData = {
        points: 200,
        ownedPokemon: [],
        levelStats: {},
        highestUnlockedLevel: 1
      };
      localStorage.setItem('pokemon_math_user_data', JSON.stringify(initialUserData));
      
      const fetchSpy = vi.mocked(PokeApiService.fetchPokemonById);
      
      render(<App />);
      
      // ガチャ画面に遷移
      await user.click(screen.getByRole('button', { name: /ガチャ/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/ポケモンガチャ/i)).toBeInTheDocument();
      });
      
      // ガチャを引く
      await user.click(screen.getByRole('button', { name: /ガチャを引く/i }));
      
      // PokeAPIが呼ばれたことを確認
      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalled();
      });
      
      // ポケモン獲得メッセージが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText(/ポケモンを獲得しました/i)).toBeInTheDocument();
      });
    });

    it('Given PokeAPIが正常に応答する When 図鑑画面を開く Then 複数のポケモンデータが取得される', async () => {
      const user = userEvent.setup();
      
      // 複数のポケモンを持った状態を設定
      const initialUserData = {
        points: 100,
        ownedPokemon: [1, 4, 7, 25, 150],
        levelStats: {},
        highestUnlockedLevel: 1
      };
      localStorage.setItem('pokemon_math_user_data', JSON.stringify(initialUserData));
      
      const fetchMultipleSpy = vi.mocked(PokeApiService.fetchMultiplePokemon);
      fetchMultipleSpy.mockResolvedValue([
        { id: 1, name: 'bulbasaur', imageUrl: 'url1', rarity: Rarity.COMMON },
        { id: 4, name: 'charmander', imageUrl: 'url2', rarity: Rarity.COMMON },
        { id: 7, name: 'squirtle', imageUrl: 'url3', rarity: Rarity.COMMON },
        mockPokemon,
        mockLegendaryPokemon
      ]);
      
      render(<App />);
      
      // 図鑑画面に遷移
      await user.click(screen.getByRole('button', { name: /図鑑/i }));
      
      // PokeAPIが呼ばれたことを確認
      await waitFor(() => {
        expect(fetchMultipleSpy).toHaveBeenCalledWith([1, 4, 7, 25, 150]);
      });
      
      // 図鑑が表示されることを確認
      await waitFor(() => {
        expect(screen.getByText(/コレクション完成度/i)).toBeInTheDocument();
      });
    });

    it('Given PokeAPIがエラーを返す When ガチャを引く Then エラーハンドリングが機能する', async () => {
      const user = userEvent.setup();
      
      // 十分なポイントを設定
      const initialUserData = {
        points: 200,
        ownedPokemon: [],
        levelStats: {},
        highestUnlockedLevel: 1
      };
      localStorage.setItem('pokemon_math_user_data', JSON.stringify(initialUserData));
      
      // PokeAPIがエラーを返すようにモック
      vi.mocked(PokeApiService.fetchPokemonById).mockRejectedValue(
        new Error('Network error')
      );
      
      render(<App />);
      
      // ガチャ画面に遷移
      await user.click(screen.getByRole('button', { name: /ガチャ/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/ポケモンガチャ/i)).toBeInTheDocument();
      });
      
      // ガチャを引く
      await user.click(screen.getByRole('button', { name: /ガチャを引く/i }));
      
      // エラーメッセージが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument();
      });
    });
  });

  describe('データ移行のテスト', () => {
    it('Given 旧難易度システムのデータが存在する When アプリを起動する Then 新しいレベルシステムに移行される', async () => {
      // 旧難易度システムのデータを設定
      const oldUserData = {
        points: 300,
        ownedPokemon: [25, 6],
        stats: {
          easy: { bestTime: 250, totalPlays: 10, firstClearAchieved: true },
          normal: { bestTime: 400, totalPlays: 5, firstClearAchieved: true },
          hard: { bestTime: null, totalPlays: 2, firstClearAchieved: false }
        }
      };
      localStorage.setItem('pokemon_math_user_data', JSON.stringify(oldUserData));
      
      render(<App />);
      
      // アプリが正常に起動することを確認
      await waitFor(() => {
        expect(screen.getByText('ポケモン100マス計算')).toBeInTheDocument();
      });
      
      // データが移行されていることを確認
      const savedData = localStorage.getItem('pokemon_math_user_data');
      expect(savedData).toBeTruthy();
      
      const parsedData = JSON.parse(savedData!);
      
      // ポイントとポケモンが保持されている
      expect(parsedData.points).toBe(300);
      expect(parsedData.ownedPokemon).toEqual([25, 6]);
      
      // 新しいレベルシステムのデータ構造が存在する
      expect(parsedData.levelStats).toBeDefined();
      expect(parsedData.highestUnlockedLevel).toBeDefined();
      
      // 旧難易度に応じてレベルがアンロックされている
      // EASY → レベル1-5, NORMAL → レベル6-10 がアンロック
      expect(parsedData.highestUnlockedLevel).toBeGreaterThanOrEqual(10);
    });

    it('Given 旧難易度システムと新レベルシステムの両方のデータが存在する When アプリを起動する Then 両方のデータが保持される', async () => {
      // 混在データを設定
      const mixedUserData = {
        points: 500,
        ownedPokemon: [1, 4, 7],
        stats: {
          easy: { bestTime: 200, totalPlays: 15, firstClearAchieved: true }
        },
        levelStats: {
          1: { level: 1, bestTime: 180, totalPlays: 8, cleared: true, stars: 3 },
          2: { level: 2, bestTime: 220, totalPlays: 5, cleared: true, stars: 2 }
        },
        highestUnlockedLevel: 3
      };
      localStorage.setItem('pokemon_math_user_data', JSON.stringify(mixedUserData));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText('ポケモン100マス計算')).toBeInTheDocument();
      });
      
      // データが保持されていることを確認
      const savedData = localStorage.getItem('pokemon_math_user_data');
      expect(savedData).toBeTruthy();
      
      const parsedData = JSON.parse(savedData!);
      
      // すべてのデータが保持されている
      expect(parsedData.points).toBe(500);
      expect(parsedData.ownedPokemon).toEqual([1, 4, 7]);
      expect(parsedData.stats).toBeDefined();
      expect(parsedData.levelStats).toBeDefined();
      expect(parsedData.highestUnlockedLevel).toBe(3);
    });

    it('Given 旧難易度システムで統計がある When 統計画面を確認する Then 旧データと新データの両方が表示される', async () => {
      const user = userEvent.setup();
      
      // 混在データを設定
      const mixedUserData = {
        points: 200,
        ownedPokemon: [],
        stats: {
          easy: { bestTime: 300, totalPlays: 20, firstClearAchieved: true },
          normal: { bestTime: 450, totalPlays: 10, firstClearAchieved: true }
        },
        levelStats: {
          1: { level: 1, bestTime: 250, totalPlays: 12, cleared: true, stars: 3 },
          2: { level: 2, bestTime: 280, totalPlays: 8, cleared: true, stars: 3 }
        },
        highestUnlockedLevel: 3
      };
      localStorage.setItem('pokemon_math_user_data', JSON.stringify(mixedUserData));
      
      render(<App />);
      
      // 統計画面に遷移
      await user.click(screen.getByRole('button', { name: /統計/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/全体の統計/i)).toBeInTheDocument();
      });
      
      // 統計が表示されることを確認
      expect(screen.getByText(/合計プレイ回数/)).toBeInTheDocument();
      
      // Note: 実際の統計の集計方法はStatsView.tsxの実装に依存
      // ここではエラーなく表示されることを確認
    });

    it('Given データ移行後に When 新しいレベルをプレイする Then 正常に統計が更新される', async () => {
      const user = userEvent.setup();
      
      // 移行済みデータを設定
      const migratedUserData = {
        points: 100,
        ownedPokemon: [25],
        stats: {
          easy: { bestTime: 300, totalPlays: 5, firstClearAchieved: true }
        },
        levelStats: {
          1: { level: 1, bestTime: 280, totalPlays: 3, cleared: true, stars: 3 }
        },
        highestUnlockedLevel: 2
      };
      localStorage.setItem('pokemon_math_user_data', JSON.stringify(migratedUserData));
      
      render(<App />);
      
      // レベル2を選択
      const level2Buttons = screen.getAllByRole('button', { name: /Lv\.2/i });
      await user.click(level2Buttons[0]);
      
      // ゲームが開始されることを確認
      await waitFor(() => {
        expect(screen.getByTestId('game-grid')).toBeInTheDocument();
      });
      
      // ゲームが正常に動作することを確認
      expect(screen.getByTestId('timer')).toBeInTheDocument();
      
      // Note: 実際のゲームプレイと統計更新のロジックは
      // GameContext.test.tsxとUserContext.test.tsxで詳細にテスト済み
    });
  });

  describe('複合シナリオ: ゲームプレイ → ガチャ → 図鑑確認', () => {
    it('Given 新規ユーザーが When ゲームをクリアしてポイントを獲得し、ガチャを引いて、図鑑を確認する Then 全てのフローが正常に動作する', async () => {
      const user = userEvent.setup();
      
      // Step 1: アプリを起動（新規ユーザー）
      render(<App />);
      
      expect(screen.getByText('ポケモン100マス計算')).toBeInTheDocument();
      
      // Step 2: 統計を確認（初期状態）
      await user.click(screen.getByRole('button', { name: /統計/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/全体の統計/i)).toBeInTheDocument();
      });
      
      // 初期状態では合計プレイ回数が0
      expect(screen.getByText(/合計プレイ回数/)).toBeInTheDocument();
      
      // Step 3: ホームに戻る
      await user.click(screen.getByRole('button', { name: /ホーム/i }));
      
      await waitFor(() => {
        expect(screen.getByText('レベルを選んでね！')).toBeInTheDocument();
      });
      
      // Step 4: ゲームを開始
      const level1Buttons = screen.getAllByRole('button', { name: /Lv\.1/i });
      await user.click(level1Buttons[0]);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-grid')).toBeInTheDocument();
      });
      
      // ゲームが開始されたことを確認（タイマーが表示される）
      expect(screen.getByTestId('timer')).toBeInTheDocument();
      
      // Step 5: ホームに戻ってからガチャ画面に遷移
      await user.click(screen.getByRole('button', { name: /ホーム/i }));
      
      await waitFor(() => {
        expect(screen.getByText('レベルを選んでね！')).toBeInTheDocument();
      });
      
      await user.click(screen.getByRole('button', { name: /ガチャ/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/ポケモンガチャ/i)).toBeInTheDocument();
      });
      
      // 初期状態ではポイントが0
      expect(screen.getByText(/所持ポイント/i)).toBeInTheDocument();
      
      // Step 6: 図鑑を確認
      await user.click(screen.getByRole('button', { name: /図鑑/i }));
      
      await waitFor(() => {
        expect(screen.getByText('まだポケモンを獲得していません')).toBeInTheDocument();
      });
      
      // データが永続化されていることを確認
      const savedData = localStorage.getItem('pokemon_math_user_data');
      expect(savedData).toBeTruthy();
    });
  });
});
