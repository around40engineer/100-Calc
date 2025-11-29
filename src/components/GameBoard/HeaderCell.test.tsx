import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HeaderCell } from './HeaderCell';

describe('HeaderCell', () => {
  describe('数字の表示', () => {
    it('Given ヘッダーセルが表示される When 数字が渡される Then その数字が表示される', () => {
      // Given & When
      render(<HeaderCell value={5} />);

      // Then
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('Given ヘッダーセルが表示される When 0が渡される Then 0が表示される', () => {
      // Given & When
      render(<HeaderCell value={0} />);

      // Then
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('Given ヘッダーセルが表示される When 2桁の数字が渡される Then その数字が表示される', () => {
      // Given & When
      render(<HeaderCell value={42} />);

      // Then
      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });

  describe('読み取り専用（タップ不可）', () => {
    it('Given ヘッダーセルが表示される When レンダリングされる Then 入力フィールドが存在しない', () => {
      // Given & When
      render(<HeaderCell value={7} />);

      // Then
      const input = screen.queryByRole('textbox');
      expect(input).not.toBeInTheDocument();
    });

    it('Given ヘッダーセルが表示される When クリックする Then 何も起こらない', async () => {
      // Given
      const user = userEvent.setup();
      render(<HeaderCell value={8} />);

      // When
      const cell = screen.getByTestId('header-cell');
      await user.click(cell);

      // Then
      // クリックしても状態が変わらないことを確認
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('Given ヘッダーセルが表示される When レンダリングされる Then ボタンではない', () => {
      // Given & When
      render(<HeaderCell value={9} />);

      // Then
      const button = screen.queryByRole('button');
      expect(button).not.toBeInTheDocument();
    });
  });

  describe('ヘッダー行・列の視覚的区別', () => {
    it('Given ヘッダーセルが表示される When レンダリングされる Then ヘッダー用のスタイルが適用される', () => {
      // Given & When
      render(<HeaderCell value={6} />);

      // Then
      const cell = screen.getByTestId('header-cell');
      expect(cell).toHaveClass('bg-gradient-to-br');
      expect(cell).toHaveClass('font-bold');
    });

    it('Given ヘッダーセルが表示される When レンダリングされる Then 回答セルと異なる背景色である', () => {
      // Given & When
      render(<HeaderCell value={3} />);

      // Then
      const cell = screen.getByTestId('header-cell');
      // ヘッダーセルはグラデーション背景を持つ
      expect(cell).toHaveClass('bg-gradient-to-br');
      // 回答セルの背景色（bg-white）とは異なる
      expect(cell).not.toHaveClass('bg-white');
    });

    it('Given ヘッダーセルが表示される When レンダリングされる Then 太字フォントが適用される', () => {
      // Given & When
      render(<HeaderCell value={4} />);

      // Then
      const cell = screen.getByTestId('header-cell');
      expect(cell).toHaveClass('font-bold');
    });

    it('Given ヘッダーセルが表示される When レンダリングされる Then 中央揃えで表示される', () => {
      // Given & When
      render(<HeaderCell value={2} />);

      // Then
      const cell = screen.getByTestId('header-cell');
      expect(cell).toHaveClass('flex');
      expect(cell).toHaveClass('items-center');
      expect(cell).toHaveClass('justify-center');
    });

    it('Given ヘッダーセルが表示される When レンダリングされる Then 適切なサイズが設定される', () => {
      // Given & When
      render(<HeaderCell value={1} />);

      // Then
      const cell = screen.getByTestId('header-cell');
      // アスペクト比で正方形を維持
      expect(cell).toHaveClass('aspect-square');
    });

    it('Given ヘッダーセルが表示される When レンダリングされる Then 境界線が表示される', () => {
      // Given & When
      render(<HeaderCell value={7} />);

      // Then
      const cell = screen.getByTestId('header-cell');
      expect(cell).toHaveClass('border-3');
      expect(cell).toHaveClass('border-blue-700');
    });
  });

  describe('アクセシビリティ', () => {
    it('Given ヘッダーセルが表示される When レンダリングされる Then 適切なテキストサイズが設定される', () => {
      // Given & When
      render(<HeaderCell value={5} />);

      // Then
      const cell = screen.getByTestId('header-cell');
      // 読みやすい大きめのフォント（レスポンシブ）
      expect(cell).toHaveClass('text-xl');
    });

    it('Given ヘッダーセルが表示される When レンダリングされる Then data-header属性が設定される', () => {
      // Given & When
      render(<HeaderCell value={8} />);

      // Then
      const cell = screen.getByTestId('header-cell');
      expect(cell).toHaveAttribute('data-header', 'true');
    });
  });
});
