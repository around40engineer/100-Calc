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
import zukanIcon from './assets/zukan.png';
import gameIcon from './assets/game.png';
import gachaIcon from './assets/gacha.png';
import dataIcon from './assets/data.png';

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
          background: 'rgba(0, 0, 0, 0.8)',
          borderTop: 'none',
          zIndex: 9999
        }}
      >
        <div className="flex justify-around items-center h-20 sm:h-24 min-h-[80px]">
          <Button
            onClick={() => setCurrentScreen('home')}
            variant="ghost"
            className="flex-1 h-16 sm:h-20 min-h-[64px] mx-1 transition-all duration-300 flex flex-col items-center justify-center"
            style={{ 
              backgroundColor: 'transparent',
              border: 'none',
              color: '#ffffff',
              transform: currentScreen === 'home' ? 'scale(1.1)' : 'scale(1)'
            }}
          >
            <img 
              src={gameIcon} 
              alt="ホーム" 
              className="block mb-1" 
              style={{ width: '42px', height: '42px', maxWidth: '42px', maxHeight: '42px' }}
            />
            <span style={{ fontSize: '10px', fontWeight: 'bold' }}>ゲーム</span>
          </Button>
          <Button
            onClick={() => setCurrentScreen('gacha')}
            variant="ghost"
            className="flex-1 h-16 sm:h-20 min-h-[64px] mx-1 transition-all duration-300 flex flex-col items-center justify-center"
            style={{ 
              backgroundColor: 'transparent',
              border: 'none',
              color: '#ffffff',
              transform: currentScreen === 'gacha' ? 'scale(1.1)' : 'scale(1)'
            }}
          >
            <img 
              src={gachaIcon} 
              alt="ガチャ" 
              className="block mb-1" 
              style={{ width: '42px', height: '42px', maxWidth: '42px', maxHeight: '42px' }}
            />
            <span style={{ fontSize: '10px', fontWeight: 'bold' }}>ガチャ</span>
          </Button>
          <Button
            onClick={() => setCurrentScreen('collection')}
            variant="ghost"
            className="flex-1 h-16 sm:h-20 min-h-[64px] mx-1 transition-all duration-300 flex flex-col items-center justify-center"
            style={{ 
              backgroundColor: 'transparent',
              border: 'none',
              color: '#ffffff',
              transform: currentScreen === 'collection' ? 'scale(1.1)' : 'scale(1)'
            }}
          >
            <img 
              src={zukanIcon} 
              alt="図鑑" 
              className="block mb-1" 
              style={{ height: '42px', maxHeight: '42px', width: 'auto', objectFit: 'contain' }}
            />
            <span style={{ fontSize: '10px', fontWeight: 'bold' }}>図鑑</span>
          </Button>
          <Button
            onClick={() => setCurrentScreen('stats')}
            variant="ghost"
            className="flex-1 h-16 sm:h-20 min-h-[64px] mx-1 transition-all duration-300 flex flex-col items-center justify-center"
            style={{ 
              backgroundColor: 'transparent',
              border: 'none',
              color: '#ffffff',
              transform: currentScreen === 'stats' ? 'scale(1.1)' : 'scale(1)'
            }}
          >
            <img 
              src={dataIcon} 
              alt="データ" 
              className="block mb-1" 
              style={{ width: '42px', height: '42px', maxWidth: '42px', maxHeight: '42px' }}
            />
            <span style={{ fontSize: '10px', fontWeight: 'bold' }}>データ</span>
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
        return (
          <div 
            style={{ 
              height: 'calc(100vh - 120px)',
              padding: '1rem',
              overflow: 'hidden'
            }}
          >
            <CollectionView />
          </div>
        );
      case 'stats':
        return <StatsView />;
      default:
        return <LevelSelector onStart={handleLevelSelect} />;
    }
  };

  return (
    <div 
      style={{ 
        background: 'linear-gradient(to bottom right, #f87171, #fde047, #60a5fa)',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
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
