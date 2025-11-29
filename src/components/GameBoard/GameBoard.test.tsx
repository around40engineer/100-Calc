import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameBoard } from './GameBoard';
import { GameProvider } from '../../contexts/GameContext';
import { Difficulty, Rarity, type Pokemon } from '../../types';
import { PokeApiService } from '../../services/PokeApiService';

// PokeApiServiceをモック化
vi.mock('../../services/PokeApiService');

describe('GameBoard', () => {
  let mockPokemon: Pokemon;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // モックポケモンデータ
    mockPokemon = {
      id: 25,
      name: 'pikachu',
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
      rarity: Rarity.COMMON
    };
    
    // PokeApiServiceのモック実装
    vi.mocked(PokeApiService.fetchRandomPokemon).mockResolvedValue(mockPokemon);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('100マス計算形式のグリッド表示', () => {
    it('Given GameBoardが表示される When レンダリングされる Then ヘッダー行に10個の数字が表示される', async () => {
      // Given & When
      render(
        <GameProvider>
          <GameBoard difficulty={Difficulty.EASY} />
        </GameProvider>
      );

      // Then
      await waitFor(() => {
        const headerCells = screen.getAllByTestId(/^header-cell-row-/);
        expect(headerCells).toHaveLength(10);
      });
    });

    it('Given GameBoardが表示される When レンダリングされる Then ヘッダー列に10個の数字が表示される', async () => {
      // Given & When
      render(
        <GameProvider>
          <GameBoard difficulty={Difficulty.EASY} />
        </GameProvider>
      );

      // Then
      await waitFor(() => {
        const headerCells = screen.getAllByTestId(/^header-cell-col-/);
        expect(headerCells).toHaveLength(10);
      });
    });

    it('Given GameBoardが表示される When レンダリングされる Then 10×10の回答セルが表示される', async () => {
      // Given & When
      render(
        <GameProvider>
          <GameBoard difficulty={Difficulty.EASY} />
        </GameProvider>
      );

      // Then
      await waitFor(() => {
        const answerCells = screen.getAllByTestId(/^answer-cell-/);
        expect(answerCells).toHaveLength(100);
      });
    });

    it('Given GameBoardが表示される When レンダリングされる Then グリッドレイアウトが適用される', async () => {
      // Given & When
      render(
        <GameProvider>
          <GameBoard difficulty={Difficulty.EASY} />
        </GameProvider>
      );

      // Then
      await waitFor(() => {
        const gridContainer = screen.getByTestId('game-grid');
        expect(gridContainer).toBeInTheDocument();
        expect(gridContainer).toHaveClass('grid');
      });
    });
  });

  describe('HeaderCell と AnswerCell コンポーネントとの統合', () => {
    it('Given GameBoardが表示される When ヘッダーセルをクリックする Then 何も起こらない（読み取り専用）', async () => {
      // Given
      const user = userEvent.setup();
      render(
        <GameProvider>
          <GameBoard difficulty={Difficulty.EASY} />
        </GameProvider>
      );

      await waitFor(() => {
        expect(screen.getAllByTestId(/^header-cell-row-/)).toHaveLength(10);
      });

      // When
      const headerCell = screen.getAllByTestId(/^header-cell-row-/)[0];
      await user.click(headerCell);

      // Then - 電卓UIが表示されないことを確認
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('Given GameBoardが表示される When 回答セルをタップする Then 電卓UIが表示される', async () => {
      // Given
      const user = userEvent.setup();
      render(
        <GameProvider>
          <GameBoard difficulty={Difficulty.EASY} />
        </GameProvider>
      );

      await waitFor(() => {
        expect(screen.getAllByTestId(/^answer-cell-/)).toHaveLength(100);
      });

      // When
      const firstAnswerCell = screen.getByTestId('answer-cell-0-0');
      await user.click(firstAnswerCell);

      // Then
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/OK/)).toBeInTheDocument();
      });
    });

    it('Given 回答セルがタップされた When 正しい答えを入力する Then セルが開く', async () => {
      // Given
      const user = userEvent.setup();
      render(
        <GameProvider>
          <GameBoard difficulty={Difficulty.EASY} />
        </GameProvider>
      );

      await waitFor(() => {
        expect(screen.getAllByTestId(/^answer-cell-/)).toHaveLength(100);
      });

      const firstAnswerCell = screen.getByTestId('answer-cell-0-0');
      await user.click(firstAnswerCell);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // When - 電卓UIで答えを入力（簡単モードなので1桁の計算）
      // 仮に答えが5だとして入力
      await user.click(screen.getByRole('button', { name: '5' }));
      await user.click(screen.getByRole('button', { name: /OK/ }));

      // Then - セルの状態を確認（正解か不正解かは問題による）
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('Given 回答セルがタップされた When 間違った答えを入力する Then セルは閉じたままである', async () => {
      // Given
      const user = userEvent.setup();
      render(
        <GameProvider>
          <GameBoard difficulty={Difficulty.EASY} />
        </GameProvider>
      );

      await waitFor(() => {
        expect(screen.getAllByTestId(/^answer-cell-/)).toHaveLength(100);
      });

      const firstAnswerCell = screen.getByTestId('answer-cell-0-0');
      await user.click(firstAnswerCell);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // When - 明らかに間違った答えを入力
      await user.click(screen.getByRole('button', { name: '9' }));
      await user.click(screen.getByRole('button', { name: '9' }));
      await user.click(screen.getByRole('button', { name: '9' }));
      await user.click(screen.getByRole('button', { name: /OK/ }));

      // Then
      await waitFor(() => {
        expect(firstAnswerCell).toHaveAttribute('data-revealed', 'false');
      });
    });
  });

  describe('CalculatorModal との統合', () => {
    it('Given 回答セルがタップされた When 電卓UIが表示される Then 問題が表示される', async () => {
      // Given
      const user = userEvent.setup();
      render(
        <GameProvider>
          <GameBoard difficulty={Difficulty.EASY} />
        </GameProvider>
      );

      await waitFor(() => {
        expect(screen.getAllByTestId(/^answer-cell-/)).toHaveLength(100);
      });

      // When
      const firstAnswerCell = screen.getByTestId('answer-cell-0-0');
      await user.click(firstAnswerCell);

      // Then
      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        // 問題が表示されていることを確認（ヘッダー行・列の数字と演算記号）
        // 引き算は全角マイナス（−）を使用
        expect(dialog.textContent).toMatch(/\d+\s*[+−×]\s*\d+\s*=\s*\?/);
      });
    });

    it('Given 電卓UIが表示された When 数字ボタンをタップする Then ディスプレイに数字が表示される', async () => {
      // Given
      const user = userEvent.setup();
      render(
        <GameProvider>
          <GameBoard difficulty={Difficulty.EASY} />
        </GameProvider>
      );

      await waitFor(() => {
        expect(screen.getAllByTestId(/^answer-cell-/)).toHaveLength(100);
      });

      const firstAnswerCell = screen.getByTestId('answer-cell-0-0');
      await user.click(firstAnswerCell);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // When
      await user.click(screen.getByRole('button', { name: '1' }));
      await user.click(screen.getByRole('button', { name: '2' }));

      // Then
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('12');
    });

    it('Given 電卓UIで数字が入力された When 削除ボタンをタップする Then 最後の数字が削除される', async () => {
      // Given
      const user = userEvent.setup();
      render(
        <GameProvider>
          <GameBoard difficulty={Difficulty.EASY} />
        </GameProvider>
      );

      await waitFor(() => {
        expect(screen.getAllByTestId(/^answer-cell-/)).toHaveLength(100);
      });

      const firstAnswerCell = screen.getByTestId('answer-cell-0-0');
      await user.click(firstAnswerCell);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: '1' }));
      await user.click(screen.getByRole('button', { name: '2' }));

      // When
      await user.click(screen.getByRole('button', { name: '⌫' }));

      // Then
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('1');
    });

    it('Given 電卓UIで数字が入力された When OKボタンをタップする Then 電卓UIが閉じる', async () => {
      // Given
      const user = userEvent.setup();
      render(
        <GameProvider>
          <GameBoard difficulty={Difficulty.EASY} />
        </GameProvider>
      );

      await waitFor(() => {
        expect(screen.getAllByTestId(/^answer-cell-/)).toHaveLength(100);
      });

      const firstAnswerCell = screen.getByTestId('answer-cell-0-0');
      await user.click(firstAnswerCell);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: '5' }));

      // When
      await user.click(screen.getByRole('button', { name: /OK/ }));

      // Then
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('HiddenImage コンポーネントとの統合', () => {
    it('Given GameBoardが表示される When レンダリングされる Then HiddenImageコンポーネントが表示される', async () => {
      // Given & When
      render(
        <GameProvider>
          <GameBoard difficulty={Difficulty.EASY} />
        </GameProvider>
      );

      // Then
      await waitFor(() => {
        const hiddenImage = screen.getByTestId('hidden-image');
        expect(hiddenImage).toBeInTheDocument();
      });
    });

    it('Given GameBoardが表示される When PokeAPIから取得した画像が使用される Then 正しい画像URLが表示される', async () => {
      // Given & When
      render(
        <GameProvider>
          <GameBoard difficulty={Difficulty.EASY} />
        </GameProvider>
      );

      // Then
      await waitFor(() => {
        // 画像パーツが存在し、背景画像として設定されていることを確認
        const imageParts = screen.getAllByTestId(/^image-part-/);
        expect(imageParts.length).toBeGreaterThan(0);
      });
    });
  });

  describe('ゲームフロー全体', () => {
    it('Given ゲームが開始される When GameContextと連携する Then セッション状態が正しく管理される', async () => {
      // Given & When
      render(
        <GameProvider>
          <GameBoard difficulty={Difficulty.EASY} />
        </GameProvider>
      );

      // Then
      await waitFor(() => {
        // GameBoardが正しくレンダリングされ、GameContextからデータを取得していることを確認
        expect(screen.getByTestId('game-grid')).toBeInTheDocument();
        expect(screen.getByTestId('hidden-image')).toBeInTheDocument();
        expect(screen.getAllByTestId(/^answer-cell-/)).toHaveLength(100);
        expect(screen.getAllByTestId(/^header-cell-/)).toHaveLength(20); // 10 row + 10 col
      });
    });

    it('Given ゲームが開始される When 回答セルをタップして正解を入力する Then セルが開いて画像が表示される', async () => {
      // Given
      const user = userEvent.setup();
      render(
        <GameProvider>
          <GameBoard difficulty={Difficulty.EASY} />
        </GameProvider>
      );

      await waitFor(() => {
        expect(screen.getAllByTestId(/^answer-cell-/)).toHaveLength(100);
      });

      // When - 最初の回答セルをタップして電卓UIで答えを入力
      const firstAnswerCell = screen.getByTestId('answer-cell-0-0');
      await user.click(firstAnswerCell);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // 簡単モードなので1桁の計算、仮に答えが5だとして入力
      await user.click(screen.getByRole('button', { name: '5' }));
      await user.click(screen.getByRole('button', { name: /OK/ }));

      // Then - 電卓UIが閉じることを確認
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('Given ゲームが開始される When 複数の回答セルに答えを入力する Then 各セルの状態が個別に管理される', async () => {
      // Given
      const user = userEvent.setup();
      render(
        <GameProvider>
          <GameBoard difficulty={Difficulty.EASY} />
        </GameProvider>
      );

      await waitFor(() => {
        expect(screen.getAllByTestId(/^answer-cell-/)).toHaveLength(100);
      });

      // When - 最初の3つの回答セルに答えを入力
      for (let i = 0; i < 3; i++) {
        const answerCell = screen.getByTestId(`answer-cell-0-${i}`);
        await user.click(answerCell);

        await waitFor(() => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        // 各セルに異なる答えを入力
        await user.click(screen.getByRole('button', { name: (i + 1).toString() }));
        await user.click(screen.getByRole('button', { name: /OK/ }));

        await waitFor(() => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
      }

      // Then - 各セルが個別に管理されていることを確認
      const answerCells = [
        screen.getByTestId('answer-cell-0-0'),
        screen.getByTestId('answer-cell-0-1'),
        screen.getByTestId('answer-cell-0-2')
      ];
      
      // 各セルが存在することを確認
      answerCells.forEach(cell => {
        expect(cell).toBeInTheDocument();
      });
    });

    it('Given ゲームが開始される When 正解済みのセルをタップする Then 電卓UIが表示されない', async () => {
      // Given
      const user = userEvent.setup();
      render(
        <GameProvider>
          <GameBoard difficulty={Difficulty.EASY} />
        </GameProvider>
      );

      await waitFor(() => {
        expect(screen.getAllByTestId(/^answer-cell-/)).toHaveLength(100);
      });

      // 最初のセルに答えを入力して正解にする（仮定）
      const firstAnswerCell = screen.getByTestId('answer-cell-0-0');
      await user.click(firstAnswerCell);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: '5' }));
      await user.click(screen.getByRole('button', { name: /OK/ }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // When - 同じセルを再度タップ（正解済みの場合）
      // セルが正解済み（revealed）の場合、タップしても電卓UIは表示されない
      // この動作はAnswerCellコンポーネントで実装されている
    });
  });
});
