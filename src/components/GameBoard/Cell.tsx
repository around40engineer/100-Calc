import { useState } from 'react';
import type { KeyboardEvent, ChangeEvent } from 'react';
import { Input } from '../ui/input';
import { OperationType, type Problem } from '../../types';
import { cn } from '../../lib/utils';

interface CellProps {
  problem: Problem;
  isRevealed: boolean;
  onAnswer: (answer: number) => void;
}

export function Cell({ problem, isRevealed, onAnswer }: CellProps) {
  const [inputValue, setInputValue] = useState('');

  const getOperationSymbol = (operation: OperationType): string => {
    switch (operation) {
      case OperationType.ADDITION:
        return '+';
      case OperationType.SUBTRACTION:
        return '-';
      case OperationType.MULTIPLICATION:
        return '×';
      default:
        return '+';
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    // 全角数字を半角数字に変換してから、数値のみを受け付ける
    let value = e.target.value;
    
    // 全角数字を半角数字に変換
    value = value.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
    
    // 数値のみを受け付ける
    value = value.replace(/[^0-9]/g, '');
    
    setInputValue(value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      const answer = parseInt(inputValue, 10);
      onAnswer(answer);
      setInputValue('');
    }
  };

  const operationSymbol = getOperationSymbol(problem.operation);

  return (
    <div
      data-testid="cell"
      data-revealed={isRevealed}
      className={cn(
        'flex flex-col items-center justify-center p-1 border rounded transition-all duration-300 w-full h-full pointer-events-auto relative z-10 box-border overflow-hidden',
        isRevealed
          ? 'bg-transparent border-transparent shadow-none'
          : 'bg-white border-gray-400 hover:border-blue-400'
      )}
    >
      {!isRevealed && (
        <>
          <div className="text-xs sm:text-sm md:text-base font-bold mb-1 text-gray-800">
            {problem.operand1} {operationSymbol} {problem.operand2}
          </div>
          <Input
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isRevealed}
            placeholder="?"
            className={cn(
              'w-10 sm:w-12 md:w-16 h-6 sm:h-8 md:h-10 text-center text-sm sm:text-base md:text-lg font-bold rounded border',
              'border-gray-300 focus:border-blue-500'
            )}
            aria-label={`Answer for ${problem.operand1} ${operationSymbol} ${problem.operand2}`}
          />
        </>
      )}
    </div>
  );
}
