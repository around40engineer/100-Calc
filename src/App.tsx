import { useState } from 'react';
import { UserProvider } from './contexts/UserContext';
import { GameProvider, useGame } from './contexts/GameContext';
import { LevelSelector } from './components/LevelSelector';
import { GameBoard } from './components/GameBoard/GameBoard';
import { GachaView } from './components/Gacha/GachaView';
import { CollectionView } from './components/Collection/CollectionView';
import { StatsView } from './components/Stats/StatsView';
import { RewardModal } from './components/Rewards/RewardModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Button } from './components/ui/button';
import { type DifficultyLevel, type Pokemon, type Reward } from './types';
import { RewardCalculator } from './services/RewardCalculator';
import { useUser } from './contexts/UserContext';

type Screen = 'home' | 'game' | 'gacha' | 'collection' | 'stats';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [showRewards, setShowRewards] = useState(false);
  
  const { session, isTimeUp, startSession, endSession, getCompletionTime } = useGame();
  const { userData, addPoints, addPokemon, updateLevelStats } = useUser();

  // レベル選択時の処理
  const handleLevelSelect = async (level: DifficultyLevel, _pokemon: Pokemon) => {
    // GameContextが独自にポケモンを取得するため、ここでは使用しない
    await startSession(level);
    setCurrentScreen('game');
  };

  // ゲーム完了時の処理
  const handleGameComplete = () => {
    if (!session || !session.isCompleted) return;

    const completionTime = getCompletionTime();
    if (completionTime === null) return;

    const level = session.difficulty as DifficultyLevel;
    const currentStats = userData.levelStats?.[level];
    
    // 報酬を計算
    const isFirstClear = !currentStats?.cleared;
    const isNewRecord = !currentStats || currentStats.bestTime === null || completionTime < currentStats.bestTime;
    
    const calculatedRewards = RewardCalculator.calculate({
      level,
      isFirstClear,
      isNewRecord,
      mistakes: session.mistakes,
      completionTime,
      pokemon: session.pokemon
    });

    // 報酬を適用
    let totalPoints = 0;
    calculatedRewards.forEach(reward => {
      totalPoints += reward.points;
      if (reward.pokemon) {
        addPokemon(reward.pokemon.id);
      }
    });
    
    addPoints(totalPoints);
    // 星の数を計算（ミス数に基づく）
    const stars = session.mistakes === 0 ? 3 : session.mistakes <= 3 ? 2 : 1;
    updateLevelStats(level, completionTime, true, stars);

    // 報酬モーダルを表示
    setRewards(calculatedRewards);
    setShowRewards(true);
  };

  // 時間切れ時の処理
  const handleTimeUp = () => {
    if (!session) return;
    
    const completionTime = session.timeLimit;
    updateLevelStats(session.difficulty as DifficultyLevel, completionTime, false, 0);
    
    // ゲームを終了してホームに戻る
    endSession();
    setCurrentScreen('home');
  };

  // 報酬モーダルを閉じる
  const handleCloseRewards = () => {
    setShowRewards(false);
    endSession();
    setCurrentScreen('home');
  };

  // ゲーム完了を監視
  if (session?.isCompleted && !showRewards) {
    handleGameComplete();
  }

  // 時間切れを監視
  if (isTimeUp && currentScreen === 'game') {
    handleTimeUp();
  }

  // ナビゲーションボタン
  const renderNavigation = () => {
    // ゲーム画面ではナビゲーションを表示しない（GameBoard内に表示）
    if (currentScreen === 'game') {
      return null;
    }

    return (
      <nav 
        className="w-full shadow-2xl px-2 sm:px-4"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to right, #dc2626, #eab308, #2563eb)',
          borderTop: '4px solid #fbbf24',
          zIndex: 9999
        }}
      >
        <div className="flex justify-around items-center h-20 sm:h-24 min-h-[80px]">
          <Button
            onClick={() => setCurrentScreen('home')}
            variant={currentScreen === 'home' ? 'default' : 'ghost'}
            className="flex-1 h-16 sm:h-20 min-h-[64px] mx-1 text-base sm:text-lg font-bold rounded-2xl transition-all duration-300"
            style={currentScreen === 'home' 
              ? { backgroundColor: '#ffffff', color: '#2563eb', border: '4px solid #fbbf24', transform: 'scale(1.1)' }
              : { color: '#ffffff' }
            }
          >
            🏠<br className="sm:hidden" /><span className="hidden sm:inline"> </span>ホーム
          </Button>
          <Button
            onClick={() => setCurrentScreen('gacha')}
            variant={currentScreen === 'gacha' ? 'default' : 'ghost'}
            className="flex-1 h-16 sm:h-20 min-h-[64px] mx-1 text-base sm:text-lg font-bold rounded-2xl transition-all duration-300"
            style={currentScreen === 'gacha' 
              ? { backgroundColor: '#ffffff', color: '#ec4899', border: '4px solid #fbbf24', transform: 'scale(1.1)' }
              : { color: '#ffffff' }
            }
          >
            🎰<br className="sm:hidden" /><span className="hidden sm:inline"> </span>ガチャ
          </Button>
          <Button
            onClick={() => setCurrentScreen('collection')}
            variant={currentScreen === 'collection' ? 'default' : 'ghost'}
            className="flex-1 h-16 sm:h-20 min-h-[64px] mx-1 text-base sm:text-lg font-bold rounded-2xl transition-all duration-300"
            style={currentScreen === 'collection' 
              ? { backgroundColor: '#ffffff', color: '#16a34a', border: '4px solid #fbbf24', transform: 'scale(1.1)' }
              : { color: '#ffffff' }
            }
          >
            📚<br className="sm:hidden" /><span className="hidden sm:inline"> </span>図鑑
          </Button>
          <Button
            onClick={() => setCurrentScreen('stats')}
            variant={currentScreen === 'stats' ? 'default' : 'ghost'}
            className="flex-1 h-16 sm:h-20 min-h-[64px] mx-1 text-base sm:text-lg font-bold rounded-2xl transition-all duration-300"
            style={currentScreen === 'stats' 
              ? { backgroundColor: '#ffffff', color: '#ea580c', border: '4px solid #fbbf24', transform: 'scale(1.1)' }
              : { color: '#ffffff' }
            }
          >
            📊<br className="sm:hidden" /><span className="hidden sm:inline"> </span>統計
          </Button>
        </div>
      </nav>
    );
  };

  // 画面のレンダリング
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <LevelSelector onStart={handleLevelSelect} />;
      case 'game':
        return (
          <div className="py-4 px-2">
            <GameBoard 
              onHome={() => {
                endSession();
                setCurrentScreen('home');
              }}
            />
          </div>
        );
      case 'gacha':
        return <GachaView />;
      case 'collection':
        return <CollectionView />;
      case 'stats':
        return <StatsView />;
      default:
        return <LevelSelector onStart={handleLevelSelect} />;
    }
  };

  return (
    <div 
      className="min-h-screen" 
      style={{ 
        background: 'linear-gradient(to bottom right, #f87171, #fde047, #60a5fa)',
        minHeight: '100vh',
        paddingBottom: currentScreen === 'game' ? '0' : '120px'
      }}
    >
      {renderScreen()}
      {renderNavigation()}
      
      {/* 報酬モーダル */}
      <RewardModal
        rewards={rewards}
        isOpen={showRewards}
        onClose={handleCloseRewards}
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <UserProvider>
        <GameProvider>
          <AppContent />
        </GameProvider>
      </UserProvider>
    </ErrorBoundary>
  );
}

export default App;
