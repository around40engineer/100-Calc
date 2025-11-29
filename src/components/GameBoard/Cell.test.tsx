import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Cell } from './Cell';
import { OperationType, type Problem } from '../../types';

describe('Cell', () => {
  const mockProblem: Problem = {
    id: '1',
    operand1: 5,
    operand2: 3,
    operation: OperationType.ADDITION,
    answer: 8
  };

  describe('問題表示', () => {
    it('Given セルが表示される When レンダリングされる Then 計算問題が表示される', () => {
      // Given & When
      render(
        <Cell
          problem={mockProblem}
          isRevealed={false}
          onAnswer={vi.fn()}
        />
      );

      // Then
      expect(screen.getByText(/5 \+ 3/)).toBeInTheDocument();
    });

    it('Given 引き算の問題である When 表示される Then 引き算記号が表示される', () => {
      // Given
      const subtractionProblem: Problem = {
        id: '2',
        operand1: 9,
        operand2: 4,
        operation: OperationType.SUBTRACTION,
        answer: 5
      };

      // When
      render(
        <Cell
          problem={subtractionProblem}
          isRevealed={false}
          onAnswer={vi.fn()}
        />
      );

      // Then
      expect(screen.getByText(/9 - 4/)).toBeInTheDocument();
    });

    it('Given 掛け算の問題である When 表示される Then 掛け算記号が表示される', () => {
      // Given
      const multiplicationProblem: Problem = {
        id: '3',
        operand1: 7,
        operand2: 6,
        operation: OperationType.MULTIPLICATION,
        answer: 42
      };

      // When
      render(
        <Cell
          problem={multiplicationProblem}
          isRevealed={false}
          onAnswer={vi.fn()}
        />
      );

      // Then
      expect(screen.getByText(/7 × 6/)).toBeInTheDocument();
    });
  });

  describe('ユーザー入力受付', () => {
    it('Given セルが表示される When レンダリングされる Then 入力フィールドが表示される', () => {
      // Given & When
      render(
        <Cell
          problem={mockProblem}
          isRevealed={false}
          onAnswer={vi.fn()}
        />
      );

      // Then
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toBeEnabled();
    });

    it('Given ユーザーが数値を入力する When 入力フィールドに入力する Then 入力値が表示される', async () => {
      // Given
      const user = userEvent.setup();
      render(
        <Cell
          problem={mockProblem}
          isRevealed={false}
          onAnswer={vi.fn()}
        />
      );

      // When
      const input = screen.getByRole('textbox');
      await user.type(input, '8');

      // Then
      expect(input).toHaveValue('8');
    });

    it('Given ユーザーが回答を入力する When Enterキーを押す Then onAnswerコールバックが呼ばれる', async () => {
      // Given
      const user = userEvent.setup();
      const mockOnAnswer = vi.fn();
      render(
        <Cell
          problem={mockProblem}
          isRevealed={false}
          onAnswer={mockOnAnswer}
        />
      );

      // When
      const input = screen.getByRole('textbox');
      await user.type(input, '8');
      await user.keyboard('{Enter}');

      // Then
      expect(mockOnAnswer).toHaveBeenCalledWith(8);
    });

    it('Given ユーザーが空の入力でEnterを押す When 入力が空である Then onAnswerが呼ばれない', async () => {
      // Given
      const user = userEvent.setup();
      const mockOnAnswer = vi.fn();
      render(
        <Cell
          problem={mockProblem}
          isRevealed={false}
          onAnswer={mockOnAnswer}
        />
      );

      // When
      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.keyboard('{Enter}');

      // Then
      expect(mockOnAnswer).not.toHaveBeenCalled();
    });

    it('Given ユーザーが数値以外を入力する When 入力する Then 数値のみが受け付けられる', async () => {
      // Given
      const user = userEvent.setup();
      render(
        <Cell
          problem={mockProblem}
          isRevealed={false}
          onAnswer={vi.fn()}
        />
      );

      // When
      const input = screen.getByRole('textbox');
      await user.type(input, 'abc123');

      // Then
      expect(input).toHaveValue('123');
    });

    it('Given ユーザーが全角数字を入力する When 入力する Then 半角数字に変換される', async () => {
      // Given
      const user = userEvent.setup();
      render(
        <Cell
          problem={mockProblem}
          isRevealed={false}
          onAnswer={vi.fn()}
        />
      );

      // When
      const input = screen.getByRole('textbox');
      await user.type(input, '１２３');

      // Then
      expect(input).toHaveValue('123');
    });
  });

  describe('正解時の動作', () => {
    it('Given 正解が入力される When Enterキーを押す Then セルが開く状態になる', async () => {
      // Given
      const user = userEvent.setup();
      const mockOnAnswer = vi.fn();
      render(
        <Cell
          problem={mockProblem}
          isRevealed={false}
          onAnswer={mockOnAnswer}
        />
      );

      // When
      const input = screen.getByRole('textbox');
      await user.type(input, '8');
      await user.keyboard('{Enter}');

      // Then
      expect(mockOnAnswer).toHaveBeenCalledWith(8);
    });

    it('Given セルが開いた状態である When isRevealedがtrueである Then 正解フィードバックが表示される', () => {
      // Given & When
      render(
        <Cell
          problem={mockProblem}
          isRevealed={true}
          onAnswer={vi.fn()}
        />
      );

      // Then
      const cell = screen.getByTestId('cell');
      expect(cell).toHaveAttribute('data-revealed', 'true');
    });

    it('Given セルが開いた状態である When isRevealedがtrueである Then 入力フィールドが非表示になる', () => {
      // Given & When
      render(
        <Cell
          problem={mockProblem}
          isRevealed={true}
          onAnswer={vi.fn()}
        />
      );

      // Then
      const input = screen.queryByRole('textbox');
      expect(input).not.toBeInTheDocument();
    });

    it('Given セルが開いた状態である When 表示される Then 正解アニメーションクラスが適用される', () => {
      // Given & When
      render(
        <Cell
          problem={mockProblem}
          isRevealed={true}
          onAnswer={vi.fn()}
        />
      );

      // Then
      const cell = screen.getByTestId('cell');
      expect(cell).toHaveClass('bg-transparent');
      expect(cell).toHaveClass('border-transparent');
      expect(cell).toHaveClass('shadow-none');
    });
  });

  describe('不正解時の動作', () => {
    it('Given 不正解が入力される When Enterキーを押す Then onAnswerコールバックが呼ばれる', async () => {
      // Given
      const user = userEvent.setup();
      const mockOnAnswer = vi.fn();
      render(
        <Cell
          problem={mockProblem}
          isRevealed={false}
          onAnswer={mockOnAnswer}
        />
      );

      // When
      const input = screen.getByRole('textbox');
      await user.type(input, '999');
      await user.keyboard('{Enter}');

      // Then
      expect(mockOnAnswer).toHaveBeenCalledWith(999);
    });

    it('Given セルが閉じた状態である When isRevealedがfalseである Then 入力フィールドが有効である', () => {
      // Given & When
      render(
        <Cell
          problem={mockProblem}
          isRevealed={false}
          onAnswer={vi.fn()}
        />
      );

      // Then
      const input = screen.getByRole('textbox');
      expect(input).toBeEnabled();
    });

    it('Given セルが閉じた状態である When 表示される Then 通常スタイルが適用される', () => {
      // Given & When
      render(
        <Cell
          problem={mockProblem}
          isRevealed={false}
          onAnswer={vi.fn()}
        />
      );

      // Then
      const cell = screen.getByTestId('cell');
      expect(cell).toHaveAttribute('data-revealed', 'false');
      expect(cell).not.toHaveClass('bg-green-100');
    });
  });

  describe('入力のクリア', () => {
    it('Given 回答が送信される When Enterキーを押す Then 入力フィールドがクリアされる', async () => {
      // Given
      const user = userEvent.setup();
      render(
        <Cell
          problem={mockProblem}
          isRevealed={false}
          onAnswer={vi.fn()}
        />
      );

      // When
      const input = screen.getByRole('textbox');
      await user.type(input, '8');
      await user.keyboard('{Enter}');

      // Then
      expect(input).toHaveValue('');
    });
  });
});
