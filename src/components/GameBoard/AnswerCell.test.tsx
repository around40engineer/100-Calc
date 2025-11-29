import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnswerCell } from './AnswerCell';

describe('AnswerCell', () => {
  describe('セルのタップ検知', () => {
    it('Given 未回答のセルが表示される When セルをタップする Then onTapコールバックが呼ばれる', async () => {
      // Given
      const user = userEvent.setup();
      const mockOnTap = vi.fn();
      render(
        <AnswerCell
          row={0}
          col={0}
          userAnswer={null}
          isCorrect={null}
          isRevealed={false}
          onTap={mockOnTap}
        />
      );

      // When
      const cell = screen.getByTestId('answer-cell-0-0');
      await user.click(cell);

      // Then
      expect(mockOnTap).toHaveBeenCalledWith(0, 0);
    });

    it('Given 正解済みのセルが表示される When セルをタップする Then onTapコールバックが呼ばれない', async () => {
      // Given
      const user = userEvent.setup();
      const mockOnTap = vi.fn();
      render(
        <AnswerCell
          row={0}
          col={0}
          userAnswer={8}
          isCorrect={true}
          isRevealed={true}
          onTap={mockOnTap}
        />
      );

      // When
      const cell = screen.getByTestId('answer-cell-0-0');
      await user.click(cell);

      // Then
      expect(mockOnTap).not.toHaveBeenCalled();
    });
  });

  describe('未回答時の表示', () => {
    it('Given 未回答のセルである When 表示される Then 空のセルが表示される', () => {
      // Given & When
      render(
        <AnswerCell
          row={0}
          col={0}
          userAnswer={null}
          isCorrect={null}
          isRevealed={false}
          onTap={vi.fn()}
        />
      );

      // Then
      const cell = screen.getByTestId('answer-cell-0-0');
      expect(cell).toBeInTheDocument();
      expect(cell).toHaveAttribute('data-revealed', 'false');
    });

    it('Given 未回答のセルである When 表示される Then タップ可能なスタイルが適用される', () => {
      // Given & When
      render(
        <AnswerCell
          row={0}
          col={0}
          userAnswer={null}
          isCorrect={null}
          isRevealed={false}
          onTap={vi.fn()}
        />
      );

      // Then
      const cell = screen.getByTestId('answer-cell-0-0');
      expect(cell).toHaveClass('cursor-pointer');
    });

    it('Given 未回答のセルである When 表示される Then 背景が不透明である', () => {
      // Given & When
      render(
        <AnswerCell
          row={0}
          col={0}
          userAnswer={null}
          isCorrect={null}
          isRevealed={false}
          onTap={vi.fn()}
        />
      );

      // Then
      const cell = screen.getByTestId('answer-cell-0-0');
      expect(cell).toHaveClass('bg-white');
    });
  });

  describe('正解時の表示', () => {
    it('Given 正解したセルである When 表示される Then 入力した数字が表示される', () => {
      // Given & When
      render(
        <AnswerCell
          row={0}
          col={0}
          userAnswer={8}
          isCorrect={true}
          isRevealed={true}
          onTap={vi.fn()}
        />
      );

      // Then
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('Given 正解したセルである When 表示される Then セルが開いた状態になる', () => {
      // Given & When
      render(
        <AnswerCell
          row={0}
          col={0}
          userAnswer={8}
          isCorrect={true}
          isRevealed={true}
          onTap={vi.fn()}
        />
      );

      // Then
      const cell = screen.getByTestId('answer-cell-0-0');
      expect(cell).toHaveAttribute('data-revealed', 'true');
    });

    it('Given 正解したセルである When 表示される Then 背景が透明になる', () => {
      // Given & When
      render(
        <AnswerCell
          row={0}
          col={0}
          userAnswer={8}
          isCorrect={true}
          isRevealed={true}
          onTap={vi.fn()}
        />
      );

      // Then
      const cell = screen.getByTestId('answer-cell-0-0');
      expect(cell).toHaveClass('bg-transparent');
    });

    it('Given 正解したセルである When 表示される Then タップ不可能になる', () => {
      // Given & When
      render(
        <AnswerCell
          row={0}
          col={0}
          userAnswer={8}
          isCorrect={true}
          isRevealed={true}
          onTap={vi.fn()}
        />
      );

      // Then
      const cell = screen.getByTestId('answer-cell-0-0');
      expect(cell).not.toHaveClass('cursor-pointer');
    });
  });

  describe('不正解時の表示', () => {
    it('Given 不正解のセルである When 表示される Then セルは閉じたままである', () => {
      // Given & When
      render(
        <AnswerCell
          row={0}
          col={0}
          userAnswer={999}
          isCorrect={false}
          isRevealed={false}
          onTap={vi.fn()}
        />
      );

      // Then
      const cell = screen.getByTestId('answer-cell-0-0');
      expect(cell).toHaveAttribute('data-revealed', 'false');
    });

    it('Given 不正解のセルである When 表示される Then 背景が不透明のままである', () => {
      // Given & When
      render(
        <AnswerCell
          row={0}
          col={0}
          userAnswer={999}
          isCorrect={false}
          isRevealed={false}
          onTap={vi.fn()}
        />
      );

      // Then
      const cell = screen.getByTestId('answer-cell-0-0');
      expect(cell).toHaveClass('bg-red-50'); // 不正解時は赤い背景
    });

    it('Given 不正解のセルである When 表示される Then 再度タップ可能である', () => {
      // Given & When
      render(
        <AnswerCell
          row={0}
          col={0}
          userAnswer={999}
          isCorrect={false}
          isRevealed={false}
          onTap={vi.fn()}
        />
      );

      // Then
      const cell = screen.getByTestId('answer-cell-0-0');
      expect(cell).toHaveClass('cursor-pointer');
    });

    it('Given 不正解のセルである When 表示される Then 不正解フィードバックが表示される', () => {
      // Given & When
      render(
        <AnswerCell
          row={0}
          col={0}
          userAnswer={999}
          isCorrect={false}
          isRevealed={false}
          onTap={vi.fn()}
        />
      );

      // Then
      const cell = screen.getByTestId('answer-cell-0-0');
      expect(cell).toHaveClass('border-red-500'); // より目立つ赤いボーダー
    });
  });

  describe('正解時のアニメーション', () => {
    it('Given 正解したセルである When 表示される Then アニメーションクラスが適用される', () => {
      // Given & When
      render(
        <AnswerCell
          row={0}
          col={0}
          userAnswer={8}
          isCorrect={true}
          isRevealed={true}
          onTap={vi.fn()}
        />
      );

      // Then
      const cell = screen.getByTestId('answer-cell-0-0');
      expect(cell).toHaveClass('transition-all');
      expect(cell).toHaveClass('duration-300');
    });

    it('Given 正解したセルである When 表示される Then 正解を示す視覚効果が適用される', () => {
      // Given & When
      render(
        <AnswerCell
          row={0}
          col={0}
          userAnswer={8}
          isCorrect={true}
          isRevealed={true}
          onTap={vi.fn()}
        />
      );

      // Then
      const cell = screen.getByTestId('answer-cell-0-0');
      expect(cell).toHaveClass('border-transparent');
    });
  });

  describe('セルの位置情報', () => {
    it('Given セルが表示される When 異なる位置のセルである Then 正しいtest-idが設定される', () => {
      // Given & When
      render(
        <AnswerCell
          row={5}
          col={7}
          userAnswer={null}
          isCorrect={null}
          isRevealed={false}
          onTap={vi.fn()}
        />
      );

      // Then
      const cell = screen.getByTestId('answer-cell-5-7');
      expect(cell).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('Given 未回答のセルである When 表示される Then 適切なaria-labelが設定される', () => {
      // Given & When
      render(
        <AnswerCell
          row={0}
          col={0}
          userAnswer={null}
          isCorrect={null}
          isRevealed={false}
          onTap={vi.fn()}
        />
      );

      // Then
      const cell = screen.getByTestId('answer-cell-0-0');
      expect(cell).toHaveAttribute('aria-label');
    });

    it('Given 正解済みのセルである When 表示される Then aria-disabledが設定される', () => {
      // Given & When
      render(
        <AnswerCell
          row={0}
          col={0}
          userAnswer={8}
          isCorrect={true}
          isRevealed={true}
          onTap={vi.fn()}
        />
      );

      // Then
      const cell = screen.getByTestId('answer-cell-0-0');
      expect(cell).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
