import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { RewardType, Rarity, type Reward } from '../../types';

interface RewardModalProps {
  isOpen: boolean;
  rewards: Reward[];
  onClose: () => void;
}

export const RewardModal: React.FC<RewardModalProps> = ({
  isOpen,
  rewards,
  onClose,
}) => {
  // 報酬からポケモンを取得
  const pokemon = rewards.find(r => r.pokemon)?.pokemon;

  // 合計ポイントを計算
  const totalPoints = rewards.reduce((sum, reward) => sum + reward.points, 0);

  // 報酬タイプの日本語名を取得
  const getRewardTypeName = (type: RewardType): string => {
    switch (type) {
      case RewardType.COMPLETION:
        return '完了報酬';
      case RewardType.FIRST_CLEAR:
        return '初クリア報酬';
      case RewardType.NEW_RECORD:
        return '新記録報酬';
      case RewardType.NO_MISTAKES:
        return 'ノーミス報酬';
      default:
        return '';
    }
  };

  // レア度の日本語名を取得
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

  // レア度に応じた背景色を取得
  const getRarityColor = (rarity: Rarity): string => {
    switch (rarity) {
      case Rarity.COMMON:
        return 'bg-gray-100';
      case Rarity.RARE:
        return 'bg-blue-100';
      case Rarity.LEGENDARY:
        return 'bg-gradient-to-br from-yellow-200 via-purple-200 to-pink-200';
      default:
        return 'bg-gray-100';
    }
  };

  // ポイントをフォーマット（カンマ区切り）
  const formatPoints = (points: number): string => {
    return points.toLocaleString('en-US');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md max-w-[95vw] animate-in fade-in-0 zoom-in-95 duration-500 !bg-white"
        style={{ backgroundColor: '#ffffff', opacity: 1 }}
      >
        <DialogHeader>
          <DialogTitle className="text-3xl sm:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-600 animate-sparkle">
            🎉 おめでとう！ 🎉
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* ポケモン獲得演出 */}
          {pokemon && (
            <div
              data-testid="pokemon-display"
              data-rarity={pokemon.rarity}
              className={`p-6 sm:p-8 rounded-2xl ${getRarityColor(pokemon.rarity)} animate-in zoom-in-50 duration-500 border-4 ${
                pokemon.rarity === Rarity.LEGENDARY ? 'border-yellow-400 shadow-2xl' :
                pokemon.rarity === Rarity.RARE ? 'border-blue-400 shadow-xl' :
                'border-gray-400 shadow-lg'
              }`}
            >
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <img
                    src={pokemon.imageUrl}
                    alt={pokemon.name}
                    className="w-48 h-48 sm:w-56 sm:h-56 mx-auto object-contain animate-bounce drop-shadow-2xl"
                  />
                  {pokemon.rarity === Rarity.LEGENDARY && (
                    <div className="absolute inset-0 animate-pulse-glow rounded-full"></div>
                  )}
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                  <p className="text-base text-gray-600 font-semibold">No. {pokemon.id}</p>
                  <h3 className="text-3xl sm:text-4xl font-bold text-gray-800">{pokemon.japaneseName}</h3>
                  <p className="text-sm text-gray-500 font-medium">{pokemon.name}</p>
                  <p className={`text-lg sm:text-xl font-bold tracking-wide ${
                    pokemon.rarity === Rarity.LEGENDARY
                      ? 'text-yellow-600 animate-sparkle'
                      : pokemon.rarity === Rarity.RARE
                      ? 'text-blue-600'
                      : 'text-gray-600'
                  }`}>
                    {getRarityName(pokemon.rarity)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 報酬一覧 */}
          <div className="space-y-3">
            <h4 className="font-bold text-xl sm:text-2xl text-gray-800">🎁 獲得報酬</h4>
            <div className="space-y-2">
              {rewards.map((reward, index) => (
                <div
                  key={`${reward.type}-${index}`}
                  data-testid={`reward-item-${index}`}
                  className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-300 shadow-md animate-slide-up hover:scale-105 transition-transform"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="font-bold text-base sm:text-lg text-gray-800">{getRewardTypeName(reward.type)}</span>
                  <span className="text-xl sm:text-2xl font-bold text-green-600">
                    +{formatPoints(reward.points)} pt
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 合計ポイント */}
          <div className="border-t-4 border-yellow-400 pt-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 shadow-lg">
            <div className="flex justify-between items-center">
              <span className="text-2xl sm:text-3xl font-bold text-gray-800">💰 合計</span>
              <span className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 animate-pulse">
                {formatPoints(totalPoints)} pt
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={onClose} 
            className="w-full h-16 text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all" 
            size="lg"
          >
            閉じる
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
