import { useState } from 'react';
import { type DifficultyLevel, type Pokemon } from '../../types';
import { LevelConfigService } from '../../services/LevelConfigService';
import { PokeApiService } from '../../services/PokeApiService';
import { useUser } from '../../contexts/UserContext';
import { Button } from '../ui/button';
import { Lock, Check, Clock } from 'lucide-react';

interface LevelSelectorProps {
  onStart: (level: DifficultyLevel, pokemon: Pokemon) => void;
}

export function LevelSelector({ onStart }: LevelSelectorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userData, isLevelUnlocked } = useUser();

  const handleLevelSelect = async (level: DifficultyLevel) => {
    // アンロック済みレベルのみ選択可能
    if (!isLevelUnlocked(level)) {
      setError('このレベルはまだロックされています');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // PokeAPIからランダムなポケモンを取得
      const pokemon = await PokeApiService.fetchRandomPokemon();
      
      // 親コンポーネントに通知
      onStart(level, pokemon);
    } catch (err) {
      setError('エラーが発生しました。もう一度お試しください。');
      console.error('Failed to fetch pokemon:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}分`;
  };

  const getLevelButtonStyle = (level: DifficultyLevel): string => {
    const isUnlocked = isLevelUnlocked(level);
    const isCleared = userData.levelStats?.[level]?.cleared || false;
    
    if (!isUnlocked) {
      return 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-500 cursor-not-allowed opacity-60';
    }
    
    if (isCleared) {
      return 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 hover:from-emerald-500 hover:via-green-600 hover:to-teal-700 text-white shadow-lg shadow-green-500/50 animate-gradient-shift';
    }
    
    // レベル範囲に応じた色分け
    if (level <= 5) {
      return 'bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600 hover:from-blue-500 hover:via-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/50 animate-gradient-shift';
    } else if (level <= 10) {
      return 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/50 animate-gradient-shift';
    } else if (level <= 15) {
      return 'bg-gradient-to-br from-purple-400 via-violet-500 to-purple-600 hover:from-purple-500 hover:via-violet-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/50 animate-gradient-shift';
    } else {
      return 'bg-gradient-to-br from-red-500 via-pink-500 to-rose-600 hover:from-red-600 hover:via-pink-600 hover:to-rose-700 text-white shadow-lg shadow-pink-500/50 animate-gradient-shift';
    }
  };

  const renderLevelButton = (level: DifficultyLevel) => {
    const config = LevelConfigService.getLevelConfig(level);
    const isUnlocked = isLevelUnlocked(level);
    const levelStats = userData.levelStats?.[level];
    const isCleared = levelStats?.cleared || false;
    const stars = levelStats?.stars || 0;

    return (
      <Button
        key={level}
        onClick={() => handleLevelSelect(level)}
        disabled={!isUnlocked || isLoading}
        className={`relative h-20 sm:h-24 flex flex-col items-center justify-center p-2 hover:shadow-2xl transform hover:scale-110 hover:-translate-y-1 transition-all duration-300 rounded-xl border-2 border-white/30 text-xs sm:text-sm ${getLevelButtonStyle(level)}`}
      >
        {/* ロック状態 */}
        {!isUnlocked && (
          <div className="flex flex-col items-center gap-2">
            <Lock className="w-8 h-8" />
            <span className="text-sm font-semibold">Lv.{level}</span>
          </div>
        )}
        
        {/* アンロック済み */}
        {isUnlocked && (
          <>
            {/* レベル番号 */}
            <div className="text-lg sm:text-xl font-bold">
              {level}
            </div>
            
            {/* クリア状態とスター */}
            {isCleared && (
              <div className="flex items-center gap-0.5">
                <Check className="w-3 h-3" />
                <div className="flex text-xs">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <span key={i} className={i < stars ? 'text-yellow-300' : 'text-gray-400'}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Button>
    );
  };

  // 100個のレベルを生成
  const levels = Array.from({ length: 100 }, (_, i) => (i + 1) as DifficultyLevel);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6">
      <div className="w-full max-w-4xl space-y-8 animate-pop-in">
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 animate-float drop-shadow-[0_6px_12px_rgba(0,0,0,0.5)] [text-shadow:_3px_3px_0_rgb(0_0_0_/_40%)]">
            ⚡ ポケモン100マス計算 ⚡
          </h1>
          <p className="text-xl sm:text-2xl text-white font-bold drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] [text-shadow:_2px_2px_0_rgb(0_0_0_/_30%)]">
            ✨ レベルを選んでね！ ✨
          </p>
        </div>

        {/* レベルグリッド（10列×10行） */}
        <div className="grid grid-cols-10 gap-2 sm:gap-3 bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 p-4 sm:p-6 rounded-3xl shadow-2xl border-4 border-yellow-300 max-h-[600px] overflow-y-auto">
          {levels.map(level => renderLevelButton(level))}
        </div>

        {/* 進捗情報 */}
        <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 p-6 rounded-2xl shadow-xl text-center border-4 border-yellow-300 animate-slide-up">
          <p className="text-xl font-bold text-white mb-2 drop-shadow-lg">
            🏆 クリア済み: <span className="text-3xl text-yellow-300 drop-shadow-lg">{Object.values(userData.levelStats || {}).filter(s => s.cleared).length}</span> / 100
          </p>
          <p className="text-lg text-white font-semibold drop-shadow-lg">
            🎯 最高レベル: <span className="text-2xl text-yellow-300 drop-shadow-lg">Lv.{userData.highestUnlockedLevel || 1}</span>
          </p>
        </div>

        {isLoading && (
          <div className="text-center p-8 bg-gradient-to-br from-purple-600 via-pink-500 to-red-600 rounded-3xl shadow-2xl border-4 border-yellow-300 animate-pop-in animate-glow">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-yellow-300 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-20 h-20 border-4 border-white border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                <div className="absolute inset-0 w-20 h-20 border-2 border-yellow-400 border-r-transparent rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
              </div>
              <p className="text-2xl sm:text-3xl text-white font-bold animate-pulse drop-shadow-lg">
                ✨ ポケモンを探しています... ✨
              </p>
              <div className="flex space-x-3">
                <div className="w-4 h-4 bg-yellow-300 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0s' }}></div>
                <div className="w-4 h-4 bg-white rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-4 h-4 bg-yellow-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center p-6 bg-gradient-to-r from-red-100 to-pink-100 border-4 border-red-400 rounded-2xl shadow-2xl animate-shake">
            <p className="text-xl sm:text-2xl text-red-700 font-bold">⚠️ {error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
