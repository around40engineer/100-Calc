import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import { Difficulty, type UserData, type DifficultyLevel } from '../types';
import { StorageService } from '../services/StorageService';

// Action types
type UserAction =
  | { type: 'ADD_POINTS'; payload: number }
  | { type: 'SPEND_POINTS'; payload: number }
  | { type: 'ADD_POKEMON'; payload: number }
  | { type: 'UPDATE_STATS'; payload: { difficulty: Difficulty; completionTime: number; isCompleted: boolean } }
  | { type: 'UPDATE_LEVEL_STATS'; payload: { level: DifficultyLevel; completionTime: number; isCompleted: boolean; stars: number } }
  | { type: 'UNLOCK_LEVEL'; payload: DifficultyLevel }
  | { type: 'LOAD_USER_DATA'; payload: UserData };

// Context type
interface UserContextType {
  userData: UserData;
  addPoints: (points: number) => void;
  spendPoints: (points: number) => void;
  addPokemon: (pokemonId: number) => void;
  updateStats: (difficulty: Difficulty, completionTime: number, isCompleted: boolean) => void;
  updateLevelStats: (level: DifficultyLevel, completionTime: number, isCompleted: boolean, stars: number) => void;
  unlockLevel: (level: DifficultyLevel) => void;
  isLevelUnlocked: (level: DifficultyLevel) => boolean;
}

// Reducer function
function userReducer(state: UserData, action: UserAction): UserData {
  switch (action.type) {
    case 'LOAD_USER_DATA':
      return action.payload;

    case 'ADD_POINTS':
      return {
        ...state,
        points: state.points + action.payload
      };

    case 'SPEND_POINTS': {
      if (action.payload < 0) {
        throw new Error('無効なポイント数です');
      }
      if (state.points < action.payload) {
        throw new Error('ポイントが足りません');
      }
      return {
        ...state,
        points: state.points - action.payload
      };
    }

    case 'ADD_POKEMON': {
      // 重複チェック: 既に所持している場合は追加しない
      if (state.ownedPokemon.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        ownedPokemon: [...state.ownedPokemon, action.payload]
      };
    }

    case 'UPDATE_STATS': {
      const { difficulty, completionTime, isCompleted } = action.payload;
      const currentStats = state.stats[difficulty];
      
      // totalPlaysは常に増加
      const newTotalPlays = currentStats.totalPlays + 1;
      
      // クリアした場合のみbestTimeとfirstClearAchievedを更新
      let newBestTime = currentStats.bestTime;
      let newFirstClearAchieved = currentStats.firstClearAchieved;
      
      if (isCompleted) {
        // bestTimeの更新（nullの場合または新記録の場合）
        if (currentStats.bestTime === null || completionTime < currentStats.bestTime) {
          newBestTime = completionTime;
        }
        
        // 初クリア達成
        if (!currentStats.firstClearAchieved) {
          newFirstClearAchieved = true;
        }
      }
      
      return {
        ...state,
        stats: {
          ...state.stats,
          [difficulty]: {
            bestTime: newBestTime,
            totalPlays: newTotalPlays,
            firstClearAchieved: newFirstClearAchieved
          }
        }
      };
    }

    case 'UPDATE_LEVEL_STATS': {
      const { level, completionTime, isCompleted, stars } = action.payload;
      
      // levelStatsが存在しない場合は初期化
      const levelStats = state.levelStats || ({} as Partial<Record<DifficultyLevel, import('../types').LevelStats>>);
      const currentLevelStats = levelStats[level] || {
        level,
        bestTime: null,
        totalPlays: 0,
        cleared: false,
        stars: 0
      };
      
      // totalPlaysは常に増加
      const newTotalPlays = currentLevelStats.totalPlays + 1;
      
      // クリアした場合のみbestTime、cleared、starsを更新
      let newBestTime = currentLevelStats.bestTime;
      let newCleared = currentLevelStats.cleared;
      let newStars = currentLevelStats.stars;
      
      if (isCompleted) {
        // bestTimeの更新（nullの場合または新記録の場合）
        if (currentLevelStats.bestTime === null || completionTime < currentLevelStats.bestTime) {
          newBestTime = completionTime;
        }
        
        // クリア状態を更新
        newCleared = true;
        
        // スターの更新（より高いスターの場合のみ）
        if (stars > currentLevelStats.stars) {
          newStars = stars;
        }
      }
      
      const updatedLevelStats: Partial<Record<DifficultyLevel, import('../types').LevelStats>> = {
        ...levelStats,
        [level]: {
          level,
          bestTime: newBestTime,
          totalPlays: newTotalPlays,
          cleared: newCleared,
          stars: newStars
        }
      };
      
      // レベルクリア時に次のレベルをアンロック
      let newHighestUnlockedLevel = state.highestUnlockedLevel || 1;
      if (isCompleted && level < 100) {
        const nextLevel = (level + 1) as DifficultyLevel;
        if (nextLevel > newHighestUnlockedLevel) {
          newHighestUnlockedLevel = nextLevel;
        }
      }
      
      return {
        ...state,
        levelStats: updatedLevelStats,
        highestUnlockedLevel: newHighestUnlockedLevel
      };
    }

    case 'UNLOCK_LEVEL': {
      const level = action.payload;
      const currentHighest = state.highestUnlockedLevel || 1;
      
      return {
        ...state,
        highestUnlockedLevel: level > currentHighest ? level : currentHighest
      };
    }

    default:
      return state;
  }
}

// Create context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export function UserProvider({ children }: { children: ReactNode }) {
  // Initialize state with data from StorageService
  const [userData, dispatch] = useReducer(userReducer, StorageService.loadUserData());

  // Save to localStorage whenever userData changes
  useEffect(() => {
    StorageService.saveUserData(userData);
  }, [userData]);

  // Action creators
  const addPoints = (points: number) => {
    dispatch({ type: 'ADD_POINTS', payload: points });
  };

  const spendPoints = (points: number) => {
    dispatch({ type: 'SPEND_POINTS', payload: points });
  };

  const addPokemon = (pokemonId: number) => {
    dispatch({ type: 'ADD_POKEMON', payload: pokemonId });
  };

  const updateStats = (difficulty: Difficulty, completionTime: number, isCompleted: boolean) => {
    dispatch({ 
      type: 'UPDATE_STATS', 
      payload: { difficulty, completionTime, isCompleted } 
    });
  };

  const updateLevelStats = (level: DifficultyLevel, completionTime: number, isCompleted: boolean, stars: number) => {
    dispatch({
      type: 'UPDATE_LEVEL_STATS',
      payload: { level, completionTime, isCompleted, stars }
    });
  };

  const unlockLevel = (level: DifficultyLevel) => {
    dispatch({
      type: 'UNLOCK_LEVEL',
      payload: level
    });
  };

  const isLevelUnlocked = (level: DifficultyLevel): boolean => {
    const highestUnlocked = userData.highestUnlockedLevel || 1;
    return level <= highestUnlocked;
  };

  const value: UserContextType = {
    userData,
    addPoints,
    spendPoints,
    addPokemon,
    updateStats,
    updateLevelStats,
    unlockLevel,
    isLevelUnlocked
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// Custom hook to use the context
export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
