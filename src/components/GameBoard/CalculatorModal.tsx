import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { OperationType } from '../../types';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (answer: number) => void;
  cellPosition: { row: number; col: number };
  headerRow: number;
  headerColumn: number;
  operation: OperationType;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  headerRow,
  headerColumn,
  operation,
}) => {
  const [display, setDisplay] = useState<string>('');

  // Reset display when modal opens
  useEffect(() => {
    if (isOpen) {
      setDisplay('');
    }
  }, [isOpen]);

  const handleNumberClick = (num: number) => {
    setDisplay((prev) => prev + num.toString());
  };

  const handleDelete = () => {
    setDisplay((prev) => prev.slice(0, -1));
  };

  const handleToggleSign = () => {
    setDisplay((prev) => {
      if (!prev || prev === '0') return prev;
      if (prev.startsWith('-')) {
        return prev.slice(1);
      } else {
        return '-' + prev;
      }
    });
  };

  const handleSubmit = () => {
    const answer = parseInt(display, 10);
    if (!isNaN(answer)) {
      onSubmit(answer);
      setDisplay('');
      onClose();
    }
  };

  const getOperationSymbol = () => {
    switch (operation) {
      case OperationType.ADDITION:
        return '+';
      case OperationType.SUBTRACTION:
        return '−';
      case OperationType.MULTIPLICATION:
        return '×';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[320px] max-w-[280px] p-4 !bg-slate-900 border-2 border-purple-500 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        style={{ backgroundColor: '#0f172a', opacity: 1 }}
      >
        <DialogHeader>
          <DialogTitle className="text-center mb-3">
            <div className="text-sm mb-1" style={{ color: '#94a3b8' }}>問題</div>
            <div className="text-3xl sm:text-4xl font-black" style={{ color: '#ffffff' }}>
              {headerColumn} {getOperationSymbol()} {headerRow} = ?
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Display Area - Compact LCD style */}
        <div
          data-testid="calculator-display"
          className="p-4 rounded-xl mb-3 text-right text-3xl sm:text-4xl font-bold min-h-[60px] flex items-center justify-end border-2 border-slate-600 shadow-lg relative overflow-hidden"
          style={{ backgroundColor: '#1e293b', opacity: 1 }}
        >
          <span className="text-cyan-300 font-mono relative z-10" style={{ color: '#67e8f9' }}>
            {display || '0'}
          </span>
        </div>

        {/* Number Buttons Grid (1-9) - Compact */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className="h-14 min-h-[56px] text-2xl font-bold !bg-slate-700 hover:!bg-blue-600 border border-slate-600 hover:border-cyan-400 text-white shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105 active:scale-95 transition-all duration-150 rounded-lg"
              style={{ backgroundColor: '#334155', opacity: 1 }}
              type="button"
            >
              {num}
            </button>
          ))}
        </div>

        {/* Bottom Row: +/-, 0, Delete - Compact */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <button
            onClick={handleToggleSign}
            className="h-14 min-h-[56px] text-2xl font-bold !bg-yellow-600 hover:!bg-yellow-500 border border-yellow-500 text-white shadow-lg hover:shadow-yellow-500/50 transform hover:scale-105 active:scale-95 transition-all duration-150 rounded-lg"
            style={{ backgroundColor: '#ca8a04', opacity: 1 }}
            type="button"
          >
            ±
          </button>
          <button
            onClick={() => handleNumberClick(0)}
            className="h-14 min-h-[56px] text-2xl font-bold !bg-slate-700 hover:!bg-blue-600 border border-slate-600 hover:border-cyan-400 text-white shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105 active:scale-95 transition-all duration-150 rounded-lg"
            style={{ backgroundColor: '#334155', opacity: 1 }}
            type="button"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-14 min-h-[56px] text-2xl font-bold !bg-red-600 hover:!bg-red-500 border border-red-500 text-white shadow-lg hover:shadow-red-500/50 transform hover:scale-105 active:scale-95 transition-all duration-150 rounded-lg"
            style={{ backgroundColor: '#dc2626', opacity: 1 }}
            type="button"
          >
            ⌫
          </button>
        </div>

        {/* Submit Button - Full width */}
        <button
          onClick={handleSubmit}
          disabled={!display}
          className="w-full h-14 min-h-[56px] text-lg font-bold !bg-green-600 hover:!bg-green-500 border border-green-500 text-white shadow-lg hover:shadow-green-500/50 transform hover:scale-105 active:scale-95 transition-all duration-150 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          style={{ backgroundColor: '#16a34a', opacity: 1 }}
          type="button"
        >
          ✓ OK
        </button>
      </DialogContent>
    </Dialog>
  );
};
