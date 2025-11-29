import { cn } from '../../lib/utils';

interface AnswerCellProps {
  row: number;
  col: number;
  userAnswer: number | null;
  isCorrect: boolean | null;
  isRevealed: boolean;
  onTap: (row: number, col: number) => void;
}

export function AnswerCell({
  row,
  col,
  userAnswer,
  isCorrect,
  isRevealed,
  onTap
}: AnswerCellProps) {
  const handleClick = () => {
    // 正解済みのセルはタップ不可
    if (isRevealed) {
      return;
    }
    onTap(row, col);
  };

  return (
    <div
      data-testid={`answer-cell-${row}-${col}`}
      data-revealed={isRevealed}
      aria-label={
        isRevealed
          ? `Answered cell at row ${row + 1}, column ${col + 1}: ${userAnswer}`
          : `Answer cell at row ${row + 1}, column ${col + 1}`
      }
      aria-disabled={isRevealed}
      onClick={handleClick}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10
      }}
      className={cn(
        'flex items-center justify-center',
        'border-2 rounded-lg transition-all duration-300',
        // 正解済み: 透明で数字だけ表示
        isRevealed && 'bg-transparent border-transparent pointer-events-none',
        // 未回答または不正解: 白背景でタップ可能
        !isRevealed && 'bg-white cursor-pointer hover:border-blue-500 hover:shadow-lg hover:scale-105 active:scale-95',
        // 不正解フィードバック
        !isRevealed && isCorrect === false && 'border-red-500 border-3 bg-red-50 animate-shake',
        // 未回答
        !isRevealed && isCorrect === null && 'border-gray-300 shadow-sm'
      )}
    >
      {/* 正解時に入力した数字を表示 */}
      {isRevealed && userAnswer !== null && (
        <span className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-bounce-in">
          {userAnswer}
        </span>
      )}
    </div>
  );
}
