import { useEffect, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { HeaderCell } from './HeaderCell';
import { AnswerCell } from './AnswerCell';
import { CalculatorModal } from './CalculatorModal';
import { HiddenImage } from './HiddenImage';
import { Difficulty, OperationType } from '../../types';

interface GameBoardProps {
  difficulty?: Difficulty;
  onHome?: () => void;
}

export const GameBoard = ({ difficulty = Difficulty.EASY, onHome }: GameBoardProps) => {
  const { session, startSession, submitAnswer, submitPokemonName, remainingTime } = useGame();
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [pokemonGuess, setPokemonGuess] = useState('');
  const [showGuessInput, setShowGuessInput] = useState(false);

  useEffect(() => {
    // セッションが存在しない場合、指定された難易度で開始
    if (!session) {
      startSession(difficulty);
    }
  }, [session, startSession, difficulty]);

  // セッションがまだ開始されていない場合はローディング表示
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-6 p-8 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border-4 border-purple-400 animate-slide-up">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-purple-500 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">
            ゲームを準備中...
          </div>
          <div className="flex space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-4 h-4 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // ヘッダー行・列の数字を生成（問題から抽出）
  // 100マス計算形式: 最初の10個の問題からヘッダー行を、次の10個からヘッダー列を生成
  const headerRow: number[] = [];
  const headerColumn: number[] = [];
  
  // 各行の最初の問題からoperand1を取得してヘッダー列とする
  for (let row = 0; row < 10; row++) {
    if (session.cells[row] && session.cells[row][0]) {
      headerColumn.push(session.cells[row][0].problem.operand1);
    }
  }
  
  // 最初の行の各問題からoperand2を取得してヘッダー行とする
  if (session.cells[0]) {
    for (let col = 0; col < 10; col++) {
      if (session.cells[0][col]) {
        headerRow.push(session.cells[0][col].problem.operand2);
      }
    }
  }

  const operation = session.cells[0]?.[0]?.problem.operation || OperationType.ADDITION;

  const handleCellTap = (row: number, col: number) => {
    // 正解済みのセルはタップ不可
    if (session.cells[row][col].isRevealed) {
      return;
    }
    
    setSelectedCell({ row, col });
    setIsCalculatorOpen(true);
  };

  const handleCalculatorSubmit = (answer: number) => {
    if (selectedCell) {
      submitAnswer(selectedCell.row, selectedCell.col, answer);
    }
    setIsCalculatorOpen(false);
    setSelectedCell(null);
  };

  const handleCalculatorClose = () => {
    setIsCalculatorOpen(false);
    setSelectedCell(null);
  };

  const handlePokemonGuess = () => {
    if (!pokemonGuess.trim()) return;
    
    const isCorrect = submitPokemonName(pokemonGuess);
    if (!isCorrect) {
      alert('不正解！もう一度挑戦してください。');
    }
    setPokemonGuess('');
    setShowGuessInput(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-2 sm:p-4 space-y-4">
      {/* ヘッダー: ホームボタンと時間表示 */}
      <div className="flex items-center justify-between glass-effect-strong px-4 py-3 rounded-2xl shadow-2xl border-2 border-white/40">
        <div className="flex items-center gap-2">
          {onHome && (
            <button
              onClick={onHome}
              className="h-10 sm:h-12 px-4 sm:px-6 text-base sm:text-lg font-bold bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-600 hover:from-blue-600 hover:via-cyan-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/50"
            >
              🏠 ホーム
            </button>
          )}
          <button
            onClick={() => setShowGuessInput(!showGuessInput)}
            className="h-10 sm:h-12 px-4 sm:px-6 text-base sm:text-lg font-bold bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 hover:from-green-600 hover:via-emerald-600 hover:to-teal-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/50"
          >
            🎯 ポケモン名を当てる
          </button>
        </div>
        {remainingTime !== null && (
          <div 
            data-testid="timer" 
            className={`text-xl sm:text-2xl font-bold transition-all duration-300 px-4 py-2 rounded-xl ${
              remainingTime <= 10 ? 'text-red-600 animate-pulse bg-red-100 shadow-lg shadow-red-500/50' : 
              remainingTime <= 30 ? 'text-orange-600 bg-orange-100 shadow-lg shadow-orange-500/50' : 
              'text-gray-800 bg-white/70'
            }`}
          >
            ⏱️ {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>

      {/* ポケモン名入力UI */}
      {showGuessInput && (
        <div className="glass-effect-strong px-4 py-4 rounded-2xl shadow-xl border-2 border-green-400 animate-slide-up">
          <div className="text-sm text-gray-800 font-semibold mb-2">✨ ポケモンの名前を入力してください（日本語または英語）</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={pokemonGuess}
              onChange={(e) => setPokemonGuess(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePokemonGuess()}
              placeholder="例: ピカチュウ または pikachu"
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none text-lg bg-white/90 backdrop-blur-sm shadow-inner"
            />
            <button
              onClick={handlePokemonGuess}
              className="px-6 py-2 text-lg font-bold bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 hover:from-green-600 hover:via-emerald-600 hover:to-teal-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/50"
            >
              回答
            </button>
          </div>
        </div>
      )}

      {/* 100マス計算形式のグリッド: 11×11 (1 corner + 10 header row + 10 header col + 100 answer cells) */}
      <div 
        data-testid="game-grid"
        className="grid gap-1 sm:gap-2 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-2 sm:p-3 rounded-3xl shadow-2xl border-4 border-white/40 glass-effect animate-gradient-shift"
        style={{ gridTemplateColumns: 'repeat(11, minmax(0, 1fr))' }}
      >
        {/* 左上のセル - 演算子を表示 */}
        <div className="aspect-square bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg shadow-md flex items-center justify-center">
          <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            {operation === OperationType.ADDITION && '+'}
            {operation === OperationType.SUBTRACTION && '−'}
            {operation === OperationType.MULTIPLICATION && '×'}
          </span>
        </div>
        
        {/* ヘッダー行（上部の10個の数字） */}
        {headerRow.map((num, index) => (
          <HeaderCell
            key={`header-row-${index}`}
            value={num}
            testId={`header-cell-row-${index}`}
          />
        ))}
        
        {/* 10行のグリッド */}
        {session.cells.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="contents">
            {/* ヘッダー列（左側の数字） */}
            <HeaderCell
              value={headerColumn[rowIndex]}
              testId={`header-cell-col-${rowIndex}`}
            />
            
            {/* 回答セル（10個） */}
            {row.map((cell, colIndex) => (
              <div key={`${rowIndex}-${colIndex}`} className="relative w-full" style={{ paddingBottom: '100%' }}>
                {/* 背景のポケモン画像パーツ */}
                <div
                  className="rounded-lg overflow-hidden"
                  data-testid={`image-part-${rowIndex * 10 + colIndex}`}
                  data-revealed={cell.isRevealed}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `url(${session.pokemon.imageUrl})`,
                    backgroundSize: '1000% 1000%',
                    backgroundPosition: `${(colIndex * 100) / 9}% ${(rowIndex * 100) / 9}%`,
                    opacity: cell.isRevealed ? 1 : 0,
                    transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
                
                {/* 回答セル（正解時は透明、未回答時は白背景） */}
                <AnswerCell
                  row={rowIndex}
                  col={colIndex}
                  userAnswer={cell.userAnswer}
                  isCorrect={cell.isCorrect}
                  isRevealed={cell.isRevealed}
                  onTap={handleCellTap}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* HiddenImage コンポーネント（テスト用） */}
      <div data-testid="hidden-image" className="hidden">
        <HiddenImage imageUrl={session.pokemon.imageUrl} cells={session.cells} />
      </div>

      {/* 電卓UI */}
      {selectedCell && (
        <CalculatorModal
          isOpen={isCalculatorOpen}
          onClose={handleCalculatorClose}
          onSubmit={handleCalculatorSubmit}
          cellPosition={selectedCell}
          headerRow={headerRow[selectedCell.col]}
          headerColumn={headerColumn[selectedCell.row]}
          operation={operation}
        />
      )}
    </div>
  );
};
