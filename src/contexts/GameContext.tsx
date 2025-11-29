import { createContext, useContext, useReducer, useEffect, useRef, type ReactNode } from 'react';
import { Difficulty, type ChallengeSession, type CellState, type Pokemon, type DifficultyLevel } from '../types';
import { ProblemGenerator } from '../services/ProblemGenerator';
import { PokeApiService } from '../services/PokeApiService';
import { LevelConfigService } from '../services/LevelConfigService';

// Action types
type GameAction =
  | { type: 'START_SESSION'; payload: { difficulty: Difficulty | DifficultyLevel; pokemon: Pokemon; timeLimit: number } }
  | { type: 'SUBMIT_ANSWER'; payload: { row: number; col: number; answer: number } }
  | { type: 'SUBMIT_POKEMON_NAME'; payload: { name: string } }
  | { type: 'UPDATE_TIMER'; payload: number }
  | { type: 'TIME_UP' }
  | { type: 'END_SESSION' };

// State type
interface GameState {
  session: ChallengeSession | null;
  remainingTime: number | null;
  isTimeUp: boolean;
}

// Context type
interface GameContextType extends GameState {
  startSession: (difficulty: Difficulty | DifficultyLevel) => Promise<void>;
  submitAnswer: (row: number, col: number, answer: number) => void;
  submitPokemonName: (name: string) => boolean;
  endSession: () => void;
  getCompletionTime: () => number | null;
}

// 難易度別の制限時間（秒）
const TIME_LIMITS: Record<Difficulty, number> = {
  [Difficulty.EASY]: 600,    // 10分
  [Difficulty.NORMAL]: 480,  // 8分
  [Difficulty.HARD]: 360     // 6分
};

// Reducer function
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_SESSION': {
      const { difficulty, pokemon, timeLimit } = action.payload;
      
      // 100マス計算用のヘッダー値を生成（10個ずつ）
      let headerProblems;
      if (typeof difficulty === 'number') {
        // DifficultyLevel の場合
        headerProblems = ProblemGenerator.generateForLevel(difficulty, 10);
      } else {
        // Difficulty enum の場合
        headerProblems = ProblemGenerator.generate(difficulty, 10);
      }
      const headerRow = headerProblems.map(p => p.operand2);
      const headerColumn = headerProblems.map(p => p.operand1);
      const operation = headerProblems[0].operation;
      
      // 10x10のグリッドに配置（ヘッダーの値を使って各セルの問題を生成）
      const cells: CellState[][] = [];
      
      for (let row = 0; row < 10; row++) {
        const rowCells: CellState[] = [];
        for (let col = 0; col < 10; col++) {
          const operand1 = headerColumn[row];
          const operand2 = headerRow[col];
          let answer: number;
          
          switch (operation) {
            case 'addition':
              answer = operand1 + operand2;
              break;
            case 'subtraction':
              answer = operand1 - operand2;
              break;
            case 'multiplication':
              answer = operand1 * operand2;
              break;
            default:
              answer = operand1 + operand2;
          }
          
          rowCells.push({
            problem: {
              id: `${Date.now()}-${row}-${col}`,
              operand1,
              operand2,
              operation,
              answer
            },
            userAnswer: null,
            isCorrect: null,
            isRevealed: false
          });
        }
        cells.push(rowCells);
      }
      
      const session: ChallengeSession = {
        id: `session-${Date.now()}`,
        difficulty,
        pokemon,
        cells,
        startTime: Date.now(),
        timeLimit,
        mistakes: 0,
        isCompleted: false
      };
      
      return {
        ...state,
        session,
        remainingTime: timeLimit,
        isTimeUp: false
      };
    }

    case 'SUBMIT_ANSWER': {
      if (!state.session || state.session.isCompleted || state.isTimeUp) {
        return state;
      }

      const { row, col, answer } = action.payload;
      const cell = state.session.cells[row][col];
      
      const isCorrect = cell.problem.answer === answer;
      
      // セルの状態を更新
      const newCells = state.session.cells.map((r, rowIndex) =>
        r.map((c, colIndex) => {
          if (rowIndex === row && colIndex === col) {
            return {
              ...c,
              userAnswer: answer,
              isCorrect,
              isRevealed: isCorrect
            };
          }
          return c;
        })
      );
      
      // ミスカウントを更新
      const newMistakes = isCorrect ? state.session.mistakes : state.session.mistakes + 1;
      
      // 全てのセルが開いたかチェック
      const allRevealed = newCells.every(row => row.every(cell => cell.isRevealed));
      
      return {
        ...state,
        session: {
          ...state.session,
          cells: newCells,
          mistakes: newMistakes,
          isCompleted: allRevealed
        }
      };
    }

    case 'UPDATE_TIMER': {
      if (!state.session || state.session.isCompleted || state.isTimeUp) {
        return state;
      }

      return {
        ...state,
        remainingTime: action.payload
      };
    }

    case 'TIME_UP': {
      return {
        ...state,
        remainingTime: 0,
        isTimeUp: true
      };
    }

    case 'SUBMIT_POKEMON_NAME': {
      if (!state.session || state.session.isCompleted || state.isTimeUp) {
        return state;
      }

      const { name } = action.payload;
      const correctEnglishName = state.session.pokemon.name.toLowerCase();
      const correctJapaneseName = state.session.pokemon.japaneseName;
      const inputName = name.toLowerCase().trim();
      
      // 英語名または日本語名で判定
      const isCorrect = inputName === correctEnglishName || inputName === correctJapaneseName;

      if (isCorrect) {
        // 全てのセルを正解扱いにして完了
        const newCells = state.session.cells.map(row =>
          row.map(cell => ({
            ...cell,
            isRevealed: true,
            isCorrect: true,
            userAnswer: cell.userAnswer || cell.problem.answer
          }))
        );

        return {
          ...state,
          session: {
            ...state.session,
            cells: newCells,
            isCompleted: true
          }
        };
      }

      // 不正解の場合はミスカウントを増やす
      return {
        ...state,
        session: {
          ...state.session,
          mistakes: state.session.mistakes + 1
        }
      };
    }

    case 'END_SESSION': {
      return {
        session: null,
        remainingTime: null,
        isTimeUp: false
      };
    }

    default:
      return state;
  }
}

// Initial state
const initialState: GameState = {
  session: null,
  remainingTime: null,
  isTimeUp: false
};

// Create context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider component
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // タイマー管理
  useEffect(() => {
    if (state.session && !state.session.isCompleted && !state.isTimeUp) {
      // タイマーを開始
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - state.session!.startTime) / 1000);
        const remaining = state.session!.timeLimit - elapsed;
        
        if (remaining <= 0) {
          dispatch({ type: 'TIME_UP' });
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        } else {
          dispatch({ type: 'UPDATE_TIMER', payload: remaining });
        }
      }, 1000);
    } else {
      // タイマーを停止
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    // クリーンアップ
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state.session, state.isTimeUp]);

  // Action creators
  const startSession = async (difficulty: Difficulty | DifficultyLevel) => {
    // PokeAPIからランダムなポケモンを取得
    const pokemon = await PokeApiService.fetchRandomPokemon();
    
    // 制限時間を取得
    let timeLimit: number;
    if (typeof difficulty === 'number') {
      // DifficultyLevel の場合
      const config = LevelConfigService.getLevelConfig(difficulty);
      timeLimit = config.timeLimit;
    } else {
      // Difficulty enum の場合
      timeLimit = TIME_LIMITS[difficulty as Difficulty];
    }
    
    dispatch({
      type: 'START_SESSION',
      payload: { difficulty, pokemon, timeLimit }
    });
  };

  const submitAnswer = (row: number, col: number, answer: number) => {
    dispatch({
      type: 'SUBMIT_ANSWER',
      payload: { row, col, answer }
    });
  };

  const submitPokemonName = (name: string): boolean => {
    if (!state.session) return false;
    
    const correctEnglishName = state.session.pokemon.name.toLowerCase();
    const correctJapaneseName = state.session.pokemon.japaneseName;
    const inputName = name.toLowerCase().trim();
    
    const isCorrect = inputName === correctEnglishName || inputName === correctJapaneseName;
    
    dispatch({
      type: 'SUBMIT_POKEMON_NAME',
      payload: { name }
    });
    
    return isCorrect;
  };

  const endSession = () => {
    dispatch({ type: 'END_SESSION' });
  };

  const getCompletionTime = (): number | null => {
    if (!state.session || !state.session.isCompleted) {
      return null;
    }
    
    const elapsed = Math.floor((Date.now() - state.session.startTime) / 1000);
    return elapsed;
  };

  const value: GameContextType = {
    session: state.session,
    remainingTime: state.remainingTime,
    isTimeUp: state.isTimeUp,
    startSession,
    submitAnswer,
    submitPokemonName,
    endSession,
    getCompletionTime
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// Custom hook to use the context
export function useGame(): GameContextType {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
