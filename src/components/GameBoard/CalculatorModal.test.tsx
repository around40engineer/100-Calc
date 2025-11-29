import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalculatorModal } from './CalculatorModal';
import { OperationType } from '../../types';

describe('CalculatorModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    cellPosition: { row: 0, col: 0 },
    headerRow: 5,
    headerColumn: 3,
    operation: OperationType.ADDITION,
  };

  describe('モーダル/ボトムシート表示', () => {
    it('Given isOpen が true When レンダリングする Then モーダルが表示される', () => {
      render(<CalculatorModal {...defaultProps} />);
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('Given isOpen が false When レンダリングする Then モーダルが表示されない', () => {
      render(<CalculatorModal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('問題表示', () => {
    it('Given 足し算の問題 When モーダルを開く Then 正しい問題が表示される', () => {
      render(<CalculatorModal {...defaultProps} operation={OperationType.ADDITION} />);
      
      expect(screen.getByText(/3 \+ 5 = \?/)).toBeInTheDocument();
    });

    it('Given 引き算の問題 When モーダルを開く Then 正しい問題が表示される', () => {
      render(<CalculatorModal {...defaultProps} operation={OperationType.SUBTRACTION} />);
      
      expect(screen.getByText(/3 − 5 = \?/)).toBeInTheDocument();
    });

    it('Given 掛け算の問題 When モーダルを開く Then 正しい問題が表示される', () => {
      render(<CalculatorModal {...defaultProps} operation={OperationType.MULTIPLICATION} />);
      
      expect(screen.getByText(/3 × 5 = \?/)).toBeInTheDocument();
    });
  });

  describe('ディスプレイエリア', () => {
    it('Given 初期状態 When モーダルを開く Then ディスプレイに0が表示される', () => {
      render(<CalculatorModal {...defaultProps} />);
      
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('0');
    });

    it('Given 数字が入力された When ディスプレイを確認する Then 入力した数字が表示される', async () => {
      const user = userEvent.setup();
      render(<CalculatorModal {...defaultProps} />);
      
      await user.click(screen.getByRole('button', { name: '1' }));
      await user.click(screen.getByRole('button', { name: '2' }));
      
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('12');
    });
  });

  describe('数字ボタン（0-9）', () => {
    it('Given モーダルが開いている When 数字ボタンをタップする Then ディスプレイに数字が追加される', async () => {
      const user = userEvent.setup();
      render(<CalculatorModal {...defaultProps} />);
      
      await user.click(screen.getByRole('button', { name: '5' }));
      
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('5');
    });

    it('Given 複数の数字 When 順番にタップする Then 全ての数字が順番に表示される', async () => {
      const user = userEvent.setup();
      render(<CalculatorModal {...defaultProps} />);
      
      await user.click(screen.getByRole('button', { name: '1' }));
      await user.click(screen.getByRole('button', { name: '2' }));
      await user.click(screen.getByRole('button', { name: '3' }));
      
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('123');
    });

    it('Given 0-9の全ての数字ボタン When レンダリングする Then 全てのボタンが表示される', () => {
      render(<CalculatorModal {...defaultProps} />);
      
      for (let i = 0; i <= 9; i++) {
        expect(screen.getByRole('button', { name: i.toString() })).toBeInTheDocument();
      }
    });
  });

  describe('削除ボタン', () => {
    it('Given 数字が入力されている When 削除ボタンをタップする Then 最後の数字が削除される', async () => {
      const user = userEvent.setup();
      render(<CalculatorModal {...defaultProps} />);
      
      await user.click(screen.getByRole('button', { name: '1' }));
      await user.click(screen.getByRole('button', { name: '2' }));
      await user.click(screen.getByRole('button', { name: '3' }));
      await user.click(screen.getByRole('button', { name: '⌫' }));
      
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('12');
    });

    it('Given 1桁の数字 When 削除ボタンをタップする Then ディスプレイが0になる', async () => {
      const user = userEvent.setup();
      render(<CalculatorModal {...defaultProps} />);
      
      await user.click(screen.getByRole('button', { name: '5' }));
      await user.click(screen.getByRole('button', { name: '⌫' }));
      
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('0');
    });

    it('Given ディスプレイが空 When 削除ボタンをタップする Then 何も起こらない', async () => {
      const user = userEvent.setup();
      render(<CalculatorModal {...defaultProps} />);
      
      await user.click(screen.getByRole('button', { name: '⌫' }));
      
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('0');
    });
  });

  describe('決定ボタン', () => {
    it('Given 数字が入力されている When 決定ボタンをタップする Then onSubmitが呼ばれる', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<CalculatorModal {...defaultProps} onSubmit={onSubmit} />);
      
      await user.click(screen.getByRole('button', { name: '8' }));
      await user.click(screen.getByRole('button', { name: /OK/ }));
      
      expect(onSubmit).toHaveBeenCalledWith(8);
    });

    it('Given 複数桁の数字 When 決定ボタンをタップする Then 正しい数値でonSubmitが呼ばれる', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<CalculatorModal {...defaultProps} onSubmit={onSubmit} />);
      
      await user.click(screen.getByRole('button', { name: '1' }));
      await user.click(screen.getByRole('button', { name: '5' }));
      await user.click(screen.getByRole('button', { name: /OK/ }));
      
      expect(onSubmit).toHaveBeenCalledWith(15);
    });

    it('Given 数字が入力されていない When 決定ボタンを確認する Then ボタンが無効化されている', () => {
      render(<CalculatorModal {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /OK/ })).toBeDisabled();
    });

    it('Given 決定ボタンをタップした When 処理が完了する Then onCloseが呼ばれる', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<CalculatorModal {...defaultProps} onClose={onClose} />);
      
      await user.click(screen.getByRole('button', { name: '5' }));
      await user.click(screen.getByRole('button', { name: /OK/ }));
      
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('ボタンサイズ', () => {
    it('Given 全てのボタン When レンダリングする Then 最低44x44pxのサイズである', () => {
      render(<CalculatorModal {...defaultProps} />);
      
      // 数字ボタン0-9 - h-14 (56px) または min-h-[56px] クラスを持つことを確認
      for (let i = 0; i <= 9; i++) {
        const button = screen.getByRole('button', { name: i.toString() });
        expect(button.className).toMatch(/h-14|min-h-\[56px\]/);
      }
      
      // 削除ボタン - h-14 (56px) または min-h-[56px] クラスを持つことを確認
      const deleteButton = screen.getByRole('button', { name: '⌫' });
      expect(deleteButton.className).toMatch(/h-14|min-h-\[56px\]/);
      
      // OKボタン - h-14 (56px) または min-h-[56px] クラスを持つことを確認
      const submitButton = screen.getByRole('button', { name: /OK/ });
      expect(submitButton.className).toMatch(/h-14|min-h-\[56px\]/);
    });
  });

  describe('外側タップで閉じる', () => {
    it('Given モーダルが開いている When オーバーレイをクリックする Then onCloseが呼ばれる', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<CalculatorModal {...defaultProps} onClose={onClose} />);
      
      const overlay = screen.getByTestId('modal-overlay');
      await user.click(overlay);
      
      expect(onClose).toHaveBeenCalled();
    });
  });
});
