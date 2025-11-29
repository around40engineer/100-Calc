import { useState } from 'react';
import { Difficulty, type Pokemon } from '../../types';
import { PokeApiService } from '../../services/PokeApiService';
import { Button } from '../ui/button';

/**
 * @deprecated このコンポーネントは非推奨です。代わりに LevelSelector を使用してください。
 * DifficultySelector は3段階の難易度選択のみをサポートしていますが、
 * LevelSelector は20段階のレベルシステムをサポートしています。
 * 
 * 移行方法:
 * ```tsx
 * // 旧: DifficultySelector
 * import { DifficultySelector } from './components/DifficultySelector';
 * <DifficultySelector onStart={(difficulty, pokemon) => {...}} />
 * 
 * // 新: LevelSelector
 * import { LevelSelector } from './components/LevelSelector';
 * <LevelSelector onStart={(level, pokemon) => {...}} />
 * ```
 */
interface DifficultySelectorProps {
  onStart: (difficulty: Difficulty, pokemon: Pokemon) => void;
}

/**
 * @deprecated このコンポーネントは非推奨です。代わりに LevelSelector を使用してください。
 * 
 * このコンポーネントは後方互換性のために残されていますが、
 * 新しいレベルシステム（レベル1-20）を使用する LevelSelector への移行を推奨します。
 */
export function DifficultySelector({ onStart }: DifficultySelectorProps) {
  // 開発環境で非推奨警告を表示
  if (import.meta.env.DEV) {
    console.warn(
      'DifficultySelector is deprecated. Please use LevelSelector instead.\n' +
      'See: src/components/LevelSelector/LevelSelector.tsx'
    );
  }
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDifficultySelect = async (difficulty: Difficulty) => {
    setIsLoading(true);
    setError(null);

    try {
      // PokeAPIからランダムなポケモンを取得
      const pokemon = await PokeApiService.fetchRandomPokemon();
      
      // 親コンポーネントに通知
      onStart(difficulty, pokemon);
    } catch (err) {
      setError('エラーが発生しました。もう一度お試しください。');
      console.error('Failed to fetch pokemon:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200">
      <div className="w-full max-w-md space-y-8 animate-bounce-in">
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4 animate-sparkle">
            ポケモン100マス計算
          </h1>
          <p className="text-xl sm:text-2xl text-gray-700 font-semibold">
            難易度を選んでね！
          </p>
        </div>

        <div className="space-y-4 sm:space-y-5">
          <Button
            onClick={() => handleDifficultySelect(Difficulty.EASY)}
            disabled={isLoading}
            className="w-full h-20 sm:h-24 text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-2xl"
            size="lg"
          >
            🌟 簡単
          </Button>

          <Button
            onClick={() => handleDifficultySelect(Difficulty.NORMAL)}
            disabled={isLoading}
            className="w-full h-20 sm:h-24 text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-2xl"
            size="lg"
          >
            ⚡ 普通
          </Button>

          <Button
            onClick={() => handleDifficultySelect(Difficulty.HARD)}
            disabled={isLoading}
            className="w-full h-20 sm:h-24 text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-2xl"
            size="lg"
          >
            🔥 難しい
          </Button>
        </div>

        {isLoading && (
          <div className="text-center p-8 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border-4 border-blue-400 animate-slide-up">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <p className="text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-bold animate-pulse">ポケモンを探しています...</p>
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center p-6 bg-red-100 border-2 border-red-400 rounded-2xl shadow-lg animate-shake">
            <p className="text-xl sm:text-2xl text-red-700 font-semibold">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
