import { useUser } from '../../contexts/UserContext';
import { Difficulty, type DifficultyLevel } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { LevelConfigService } from '../../services/LevelConfigService';

export function StatsView() {
  const { userData } = useUser();

  // 時間を分秒形式にフォーマット
  const formatTime = (seconds: number | null): string => {
    if (seconds === null) {
      return '--';
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}分${remainingSeconds}秒`;
    }
    return `${seconds}秒`;
  };

  // 合計プレイ回数を計算（既存の難易度ベース + 新しいレベルベース）
  const totalPlays = (userData.stats ? Object.values(userData.stats).reduce(
    (sum, stat) => sum + stat.totalPlays,
    0
  ) : 0) + (userData.levelStats ? Object.values(userData.levelStats).reduce(
    (sum, stat) => sum + (stat?.totalPlays || 0),
    0
  ) : 0);



  // レベル統計を取得（1-20）
  const levelStats = userData.levelStats || {};
  const allLevels: DifficultyLevel[] = Array.from({ length: 20 }, (_, i) => (i + 1) as DifficultyLevel);
  
  // クリア済みレベル数を計算
  const clearedLevelsCount = allLevels.filter(level => levelStats[level]?.cleared).length;
  
  // 全体の進捗率を計算
  const progressPercentage = (clearedLevelsCount / 20) * 100;

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <h1 className="text-4xl sm:text-5xl font-bold text-center mb-8 text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
        📊 統計
      </h1>

      {/* サマリーカード */}
      <Card data-testid="summary-card" className="shadow-xl border-4 border-yellow-400 rounded-3xl overflow-hidden bg-gradient-to-br from-red-500 via-yellow-400 to-blue-500">
        <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white border-b-4 border-yellow-300">
          <CardTitle className="text-2xl sm:text-3xl font-bold drop-shadow-lg">🏆 全体の統計</CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-gradient-to-br from-yellow-200 via-orange-200 to-red-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl shadow-lg border-2 border-blue-300">
              <div className="text-lg sm:text-xl text-gray-700 mb-3 font-semibold">💰 現在のポイント</div>
              <div className="text-4xl sm:text-5xl font-bold text-blue-600">
                {userData.points.toLocaleString()}pt
              </div>
            </div>
            <div className="flex flex-col items-center p-6 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl shadow-lg border-2 border-green-300">
              <div className="text-lg sm:text-xl text-gray-700 mb-3 font-semibold">🎮 合計プレイ回数</div>
              <div className="text-4xl sm:text-5xl font-bold text-green-600">
                {totalPlays}回
              </div>
            </div>
            <div className="flex flex-col items-center p-6 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl shadow-lg border-2 border-yellow-300">
              <div className="text-lg sm:text-xl text-gray-700 mb-3 font-semibold">🎯 進捗率</div>
              <div className="text-4xl sm:text-5xl font-bold text-yellow-600">
                {progressPercentage.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600 mt-2">
                {clearedLevelsCount}/20 レベルクリア
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* レベル別統計カード */}
      {userData.levelStats && Object.keys(userData.levelStats).length > 0 && (
        <Card data-testid="level-stats-card" className="shadow-xl border-4 border-yellow-400 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-500 via-purple-400 to-pink-500">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-b-4 border-yellow-300">
            <CardTitle className="text-2xl sm:text-3xl font-bold drop-shadow-lg">🎮 レベル別の記録</CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200">
            <div className="overflow-x-auto">
              <table className="w-full text-base sm:text-lg" role="table">
                <thead>
                  <tr className="border-b-4 border-indigo-300 bg-indigo-50">
                    <th className="text-left p-4 sm:p-5 font-bold text-gray-800">レベル</th>
                    <th className="text-left p-4 sm:p-5 font-bold text-gray-800">⏱️ ベストタイム</th>
                    <th className="text-left p-4 sm:p-5 font-bold text-gray-800">🎯 プレイ回数</th>
                    <th className="text-left p-4 sm:p-5 font-bold text-gray-800">⭐ スター</th>
                  </tr>
                </thead>
                <tbody>
                  {allLevels.map(level => {
                    const stats = levelStats[level];
                    const config = LevelConfigService.getLevelConfig(level);
                    
                    if (!stats || stats.totalPlays === 0) {
                      return null;
                    }
                    
                    return (
                      <tr 
                        key={level} 
                        className={`border-b-2 border-gray-200 hover:bg-indigo-50 transition-colors ${stats.cleared ? 'bg-green-50' : ''}`}
                      >
                        <td className="p-4 sm:p-5 font-bold text-gray-800">
                          {stats.cleared && '✅ '}
                          レベル {level}: {config.name}
                        </td>
                        <td className="p-4 sm:p-5 font-semibold text-gray-700">
                          {formatTime(stats.bestTime)}
                        </td>
                        <td className="p-4 sm:p-5 font-semibold text-gray-700">
                          {stats.totalPlays}回
                        </td>
                        <td className="p-4 sm:p-5 font-semibold text-yellow-600">
                          {'⭐'.repeat(stats.stars)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}


    </div>
  );
}
