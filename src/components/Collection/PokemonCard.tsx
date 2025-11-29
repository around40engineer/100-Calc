import { Card, CardContent } from '../ui/card';
import { type Pokemon, Rarity } from '../../types';

interface PokemonCardProps {
  pokemon: Pokemon;
  isOwned: boolean;
}

export function PokemonCard({ pokemon, isOwned }: PokemonCardProps) {
  const getRarityColor = (rarity: Rarity): string => {
    switch (rarity) {
      case Rarity.COMMON:
        return 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-400';
      case Rarity.RARE:
        return 'bg-gradient-to-br from-blue-100 via-cyan-100 to-blue-200 border-blue-500 shadow-lg shadow-blue-500/30';
      case Rarity.LEGENDARY:
        return 'bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-200 border-yellow-500 shadow-xl shadow-yellow-500/50 animate-glow';
      default:
        return 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-400';
    }
  };

  const getRarityBadgeColor = (rarity: Rarity): string => {
    switch (rarity) {
      case Rarity.COMMON:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
      case Rarity.RARE:
        return 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/50';
      case Rarity.LEGENDARY:
        return 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-600 text-white shadow-xl shadow-yellow-500/50';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const getRarityName = (rarity: Rarity): string => {
    switch (rarity) {
      case Rarity.COMMON:
        return 'ノーマル';
      case Rarity.RARE:
        return 'レア';
      case Rarity.LEGENDARY:
        return 'レジェンド';
      default:
        return '';
    }
  };

  return (
    <Card
      data-testid="pokemon-card"
      data-owned={isOwned}
      data-rarity={pokemon.rarity}
      className={`
        ${isOwned ? getRarityColor(pokemon.rarity) : 'bg-gradient-to-br from-gray-200 to-gray-300 border-gray-400'}
        ${isOwned ? 'hover:shadow-2xl hover:scale-110 hover:-translate-y-2 transition-all duration-300 cursor-pointer' : 'opacity-70'}
        border-4 rounded-2xl overflow-hidden
      `}
    >
      <CardContent className="p-4 sm:p-6 bg-white/50 backdrop-blur-sm">
        <div className="flex flex-col items-center space-y-3">
          {/* ポケモン画像 */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center relative">
            {isOwned ? (
              <>
                <img
                  src={pokemon.imageUrl}
                  alt={pokemon.name}
                  className="w-full h-full object-contain animate-pop-in drop-shadow-xl"
                />
                {pokemon.rarity === Rarity.LEGENDARY && (
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full blur-xl animate-pulse"></div>
                )}
              </>
            ) : (
              // 未獲得の場合はシルエット
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-8xl text-gray-400">❓</div>
              </div>
            )}
          </div>

          {/* ポケモンID */}
          <div className={`text-base sm:text-lg font-mono font-bold px-3 py-1 rounded-full ${
            isOwned ? 'text-gray-700 bg-white/70' : 'text-gray-500 bg-gray-300/70'
          }`}>
            No. {pokemon.id.toString().padStart(3, '0')}
          </div>

          {/* ポケモン名 */}
          <div className={`text-lg sm:text-xl font-bold drop-shadow ${
            isOwned ? 'text-gray-800' : 'text-gray-500'
          }`}>
            {isOwned ? pokemon.japaneseName : '？？？'}
          </div>
          {isOwned && (
            <div className="text-sm text-gray-600 font-semibold">
              {pokemon.name}
            </div>
          )}

          {/* レア度バッジ（獲得済みの場合のみ） */}
          {isOwned && (
            <div
              className={`
                ${getRarityBadgeColor(pokemon.rarity)}
                px-4 py-2 rounded-full text-sm sm:text-base font-bold
                ${pokemon.rarity === Rarity.LEGENDARY ? 'animate-sparkle' : ''}
                border-2 border-white/50
              `}
            >
              {getRarityName(pokemon.rarity)}
            </div>
          )}
          
          {/* 未獲得バッジ */}
          {!isOwned && (
            <div className="px-4 py-2 rounded-full text-sm sm:text-base font-bold bg-gray-400 text-white border-2 border-gray-500">
              未獲得
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
