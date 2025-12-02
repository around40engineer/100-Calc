import { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { GachaService } from '../../services/GachaService';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Rarity, type Pokemon } from '../../types';

const GACHA_COST = 100;

export function GachaView() {
  const { userData, spendPoints, addPokemon } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultPokemon, setResultPokemon] = useState<Pokemon | null>(null);
  const [showResult, setShowResult] = useState(false);

  const canPullGacha = userData.points >= GACHA_COST;

  const handlePullGacha = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 最高到達レベルを取得してガチャに渡す
      const result = await GachaService.pull(userData.points, userData.highestUnlockedLevel);

      if (result.success && result.pokemon) {
        // ポイントを消費
        spendPoints(GACHA_COST);
        
        // ポケモンをコレクションに追加
        addPokemon(result.pokemon.id);
        
        // 結果を表示
        setResultPokemon(result.pokemon);
        setShowResult(true);
      }
    } catch (err) {
      setError('エラーが発生しました。もう一度お試しください。');
      console.error('Gacha error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setResultPokemon(null);
  };

  const handleRetry = () => {
    setError(null);
    handlePullGacha();
  };

  const getRarityColor = (rarity: Rarity): string => {
    switch (rarity) {
      case Rarity.LEGENDARY:
        return 'bg-yellow-400';
      case Rarity.RARE:
        return 'bg-blue-400';
      case Rarity.COMMON:
      default:
        return 'bg-gray-400';
    }
  };

  const getRarityBorderColor = (rarity: Rarity): string => {
    switch (rarity) {
      case Rarity.LEGENDARY:
        return 'border-yellow-500';
      case Rarity.RARE:
        return 'border-blue-500';
      case Rarity.COMMON:
      default:
        return 'border-gray-500';
    }
  };

  return (
    <div className="max-w-2xl animate-pop-in">
      <Card className="shadow-2xl border-4 border-yellow-400 rounded-3xl overflow-hidden bg-gradient-to-br from-red-500 via-yellow-400 to-blue-500">
        <CardHeader className="bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 text-white animate-gradient-shift border-b-4 border-yellow-300">
          <CardTitle className="text-3xl sm:text-4xl text-center font-bold drop-shadow-lg animate-float">🎰 ポケモンガチャ 🎰</CardTitle>
          <CardDescription className="text-center text-lg sm:text-xl text-white font-bold drop-shadow-md">
            ✨ ポイントを使ってポケモンを獲得しよう！ ✨
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6 bg-gradient-to-br from-blue-400 via-cyan-300 to-green-400">
          {/* ポイント表示 */}
          <div className="text-center p-6 bg-gradient-to-br from-yellow-200 via-amber-200 to-orange-200 rounded-2xl shadow-xl border-4 border-yellow-400 animate-glow">
            <p className="text-lg sm:text-xl text-gray-800 font-bold mb-2 drop-shadow">💰 所持ポイント</p>
            <p className="text-6xl sm:text-7xl font-bold text-yellow-800 animate-pulse drop-shadow-lg">{userData.points}</p>
          </div>

          {/* ガチャコスト表示 */}
          <div className="text-center p-6 border-4 border-dashed border-purple-500 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 shadow-lg">
            <p className="text-xl sm:text-2xl font-bold text-purple-800 drop-shadow">🎫 ガチャ1回</p>
            <p className="text-4xl sm:text-5xl font-bold text-purple-800 mt-2 drop-shadow-lg">{GACHA_COST} ポイント</p>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="p-6 bg-red-100 border-4 border-red-400 rounded-2xl shadow-lg animate-shake">
              <p className="text-red-700 text-center font-bold text-lg sm:text-xl">{error}</p>
              <div className="mt-4 text-center">
                <Button onClick={handleRetry} variant="outline" size="lg" className="h-12 px-8 text-lg font-semibold">
                  🔄 再試行
                </Button>
              </div>
            </div>
          )}

          {/* ポイント不足メッセージ */}
          {!canPullGacha && !error && (
            <div className="p-6 bg-yellow-100 border-4 border-yellow-400 rounded-2xl shadow-lg">
              <p className="text-yellow-800 text-center font-bold text-xl sm:text-2xl mb-2">
                ⚠️ ポイントが足りません
              </p>
              <p className="text-yellow-700 text-center text-base sm:text-lg font-semibold">
                100マス計算をクリアしてポイントを獲得しましょう！
              </p>
            </div>
          )}

          {/* ガチャボタン */}
          <div className="text-center">
            <Button
              onClick={handlePullGacha}
              disabled={!canPullGacha || isLoading}
              size="lg"
              className="w-full max-w-md h-24 sm:h-28 text-2xl sm:text-3xl font-bold bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:via-purple-700 hover:to-indigo-700 text-white shadow-2xl hover:shadow-pink-500/50 transform hover:scale-110 hover:-translate-y-2 transition-all duration-300 rounded-2xl border-4 border-white/50 animate-gradient-shift disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-10 h-10 border-4 border-pink-300 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
                  </div>
                  ✨ ガチャ中... ✨
                </span>
              ) : (
                '🎲 ガチャを引く 🎲'
              )}
            </Button>
          </div>

          {/* レア度説明 */}
          <div className="mt-6 p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-lg border-2 border-gray-300">
            <p className="text-lg sm:text-xl font-bold mb-4 text-gray-800">✨ レア度について</p>
            <div className="space-y-3 text-base sm:text-lg">
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow">
                <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
                <span className="font-semibold">コモン (90%)</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow">
                <div className="w-6 h-6 bg-blue-400 rounded-full"></div>
                <span className="font-semibold">レア (8%)</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow">
                <div className="w-6 h-6 bg-yellow-400 rounded-full animate-sparkle"></div>
                <span className="font-semibold">レジェンダリー (2%)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 結果表示ダイアログ */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent 
          className="sm:max-w-lg max-w-[90vw] max-h-[85vh] overflow-y-auto !bg-white px-4 py-3 sm:px-6 sm:py-4"
          style={{ backgroundColor: '#ffffff', opacity: 1 }}
        >
          <DialogHeader className="pb-1">
            <DialogTitle className="text-lg sm:text-2xl text-center font-bold text-purple-600">
              🎉 ポケモンを獲得！ 🎉
            </DialogTitle>
          </DialogHeader>
          
          {resultPokemon && (
            <div
              data-testid="gacha-result"
              data-rarity={resultPokemon.rarity}
              className={`p-3 sm:p-6 rounded-lg sm:rounded-2xl ${getRarityColor(resultPokemon.rarity)} ${getRarityBorderColor(resultPokemon.rarity)} border-2 sm:border-4 animate-bounce-in shadow-lg sm:shadow-2xl`}
            >
              <div className="text-center space-y-2 sm:space-y-4">
                {/* ポケモン画像 */}
                <div className="relative">
                  <img
                    src={resultPokemon.imageUrl}
                    alt={resultPokemon.japaneseName}
                    className="mx-auto object-contain animate-bounce"
                    style={{ width: '300px', height: '300px', maxWidth: '100%' }}
                  />
                </div>

                {/* ポケモン情報 */}
                <div className="bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-2xl p-3 sm:p-4 space-y-1 sm:space-y-2 shadow-md sm:shadow-lg">
                  <p className="text-xs sm:text-base text-gray-600 font-semibold">No. {resultPokemon.id}</p>
                  <p className="text-xl sm:text-3xl font-bold">{resultPokemon.japaneseName}</p>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">{resultPokemon.name}</p>
                  <div className="flex items-center justify-center gap-2">
                    <div className={`w-3 h-3 sm:w-4 sm:h-4 ${getRarityColor(resultPokemon.rarity)} rounded-full ${resultPokemon.rarity === Rarity.LEGENDARY ? 'animate-sparkle' : ''}`}></div>
                    <p className="text-sm sm:text-lg font-bold tracking-wide">
                      {resultPokemon.rarity === Rarity.COMMON ? 'ノーマル' : 
                       resultPokemon.rarity === Rarity.RARE ? 'レア' : 'レジェンド'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-center mt-3 sm:mt-4">
            <Button onClick={handleCloseResult} className="w-full h-10 sm:h-14 text-base sm:text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg sm:rounded-xl">
              閉じる
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
