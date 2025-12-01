import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { PokemonCard } from './PokemonCard';
import { useUser } from '../../contexts/UserContext';
import { PokeApiService } from '../../services/PokeApiService';
import { Rarity, type Pokemon } from '../../types';

const TOTAL_POKEMON = 1025; // 全ポケモン（第9世代まで）

type FilterType = 'all' | Rarity;

export function CollectionView() {
  const { userData } = useUser();
  const [allPokemon, setAllPokemon] = useState<(Pokemon | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  const loadAllPokemon = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 獲得済みのポケモンのみ実際のデータを取得
      let ownedPokemonData: Pokemon[] = [];
      if (userData.ownedPokemon.length > 0) {
        try {
          ownedPokemonData = await PokeApiService.fetchMultiplePokemon(userData.ownedPokemon);
        } catch (err) {
          setError('エラーが発生しました');
          console.error('Failed to load pokemon:', err);
          setLoading(false);
          return;
        }
      }
      
      // 全151匹のポケモンデータを作成
      const allPokemonData = Array.from({ length: TOTAL_POKEMON }, (_, index) => {
        const pokemonId = index + 1;
        const ownedPokemon = ownedPokemonData.find(p => p.id === pokemonId);
        
        if (ownedPokemon) {
          return ownedPokemon;
        } else {
          // 未獲得の場合はプレースホルダーを返す
          return {
            id: pokemonId,
            name: '???',
            japaneseName: '???',
            imageUrl: '', // 空の画像URL
            rarity: Rarity.COMMON // デフォルトのレア度
          } as Pokemon;
        }
      });
      
      setAllPokemon(allPokemonData);
    } catch (err) {
      setError('エラーが発生しました');
      console.error('Failed to load pokemon:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllPokemon();
  }, [userData.ownedPokemon]);

  const handleRetry = () => {
    loadAllPokemon();
  };

  // フィルタリング処理
  const filteredPokemon = allPokemon.filter((pokemon): pokemon is Pokemon => {
    if (!pokemon) return false;
    
    if (filter === 'all') return true;
    
    // 未獲得のポケモンはフィルタリングから除外
    if (pokemon.name === '???') return false;
    
    return pokemon.rarity === filter;
  });

  const completionPercentage = (userData.ownedPokemon.length / TOTAL_POKEMON) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-6 p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-700">ポケモンを読み込み中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6 p-6">
        <div className="text-2xl sm:text-3xl text-red-600 font-bold text-center bg-red-100 p-8 rounded-3xl border-4 border-red-400 shadow-xl animate-shake">
          {error}
        </div>
        <Button onClick={handleRetry} className="h-16 px-12 text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-2xl">
          🔄 再試行
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto p-4 sm:p-6 space-y-6 animate-pop-in max-w-7xl">
      {/* 完成度表示 */}
      <Card className="shadow-2xl border-4 border-yellow-400 rounded-3xl overflow-hidden bg-gradient-to-br from-red-500 via-yellow-400 to-blue-500">
        <CardHeader className="bg-gradient-to-br from-green-600 via-emerald-500 to-teal-500 text-white animate-gradient-shift border-b-4 border-yellow-300">
          <CardTitle className="text-2xl sm:text-3xl font-bold drop-shadow-lg animate-float">📚 コレクション完成度 📚</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6 bg-gradient-to-br from-yellow-300 via-green-300 to-blue-300">
          <div className="flex items-center justify-between">
            <div className="text-5xl sm:text-6xl font-bold text-blue-900 drop-shadow-lg">
              {userData.ownedPokemon.length} / {TOTAL_POKEMON}
            </div>
            <div className="text-4xl sm:text-5xl text-green-900 font-bold drop-shadow-lg">
              {completionPercentage.toFixed(1)}%
            </div>
          </div>
          
          {/* プログレスバー */}
          <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-8 sm:h-10 overflow-hidden shadow-inner border-2 border-gray-400">
            <div
              data-testid="completion-progress"
              className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 h-full transition-all duration-500 shadow-xl animate-gradient-shift"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* フィルターボタン */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => setFilter('all')}
          className={`h-14 sm:h-16 px-6 sm:px-8 text-lg sm:text-xl font-bold rounded-2xl transition-all duration-300 border-2 ${
            filter === 'all' 
              ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-600 text-white shadow-xl shadow-blue-500/50 scale-110 border-white/50 animate-gradient-shift' 
              : 'glass-effect text-gray-700 hover:glass-effect-strong hover:scale-105 border-white/30'
          }`}
          variant="ghost"
        >
          ✨ すべて
        </Button>
        <Button
          onClick={() => setFilter(Rarity.COMMON)}
          className={`h-14 sm:h-16 px-6 sm:px-8 text-lg sm:text-xl font-bold rounded-2xl transition-all duration-300 border-2 ${
            filter === Rarity.COMMON 
              ? 'bg-gradient-to-br from-gray-400 to-gray-600 text-white shadow-xl shadow-gray-500/50 scale-110 border-white/50' 
              : 'glass-effect text-gray-700 hover:glass-effect-strong hover:scale-105 border-white/30'
          }`}
          variant="ghost"
        >
          ノーマル
        </Button>
        <Button
          onClick={() => setFilter(Rarity.RARE)}
          className={`h-14 sm:h-16 px-6 sm:px-8 text-lg sm:text-xl font-bold rounded-2xl transition-all duration-300 border-2 ${
            filter === Rarity.RARE 
              ? 'bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600 text-white shadow-xl shadow-blue-500/50 scale-110 border-white/50 animate-gradient-shift' 
              : 'glass-effect text-gray-700 hover:glass-effect-strong hover:scale-105 border-white/30'
          }`}
          variant="ghost"
        >
          レア
        </Button>
        <Button
          onClick={() => setFilter(Rarity.LEGENDARY)}
          className={`h-14 sm:h-16 px-6 sm:px-8 text-lg sm:text-xl font-bold rounded-2xl transition-all duration-300 border-2 ${
            filter === Rarity.LEGENDARY 
              ? 'bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 text-white shadow-xl shadow-yellow-500/50 scale-110 border-white/50 animate-sparkle animate-gradient-shift' 
              : 'glass-effect text-gray-700 hover:glass-effect-strong hover:scale-105 border-white/30'
          }`}
          variant="ghost"
        >
          ⭐ レジェンド
        </Button>
      </div>

      {/* ポケモングリッド */}
      {filteredPokemon.length === 0 ? (
        <div className="text-center py-16 text-xl sm:text-2xl text-gray-600 font-semibold bg-white rounded-2xl shadow-lg p-8">
          該当するポケモンがいません
        </div>
      ) : (
        <div
          data-testid="pokemon-grid"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6"
        >
          {filteredPokemon.map(pokemon => {
            const isOwned = userData.ownedPokemon.includes(pokemon.id);
            return (
              <PokemonCard
                key={pokemon.id}
                pokemon={pokemon}
                isOwned={isOwned}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
