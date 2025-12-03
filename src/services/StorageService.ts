import { Difficulty, type UserData, type DifficultyLevel, type LevelStats, type ExportData } from '../types';

export class StorageService {
  private static readonly KEYS = {
    USER_DATA: 'pokemon_math_user_data',
    CURRENT_SESSION: 'pokemon_math_current_session'
  };

  static saveUserData(data: UserData): void {
    try {
      localStorage.setItem(
        this.KEYS.USER_DATA,
        JSON.stringify(data)
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        // 現在のセッションデータを削除して再試行
        localStorage.removeItem(this.KEYS.CURRENT_SESSION);
        localStorage.setItem(
          this.KEYS.USER_DATA,
          JSON.stringify(data)
        );
      } else {
        throw error;
      }
    }
  }

  static loadUserData(): UserData {
    const data = localStorage.getItem(this.KEYS.USER_DATA);
    if (!data) {
      return this.getDefaultUserData();
    }
    
    const parsedData = JSON.parse(data) as UserData;
    
    // 新しいレベルシステムのフィールドが存在しない場合は初期化
    if (!parsedData.levelStats) {
      parsedData.levelStats = {};
    }
    if (!parsedData.highestUnlockedLevel) {
      parsedData.highestUnlockedLevel = 1 as DifficultyLevel;
    }
    
    // ownedPokemonの重複を削除（マイグレーション）
    const originalLength = parsedData.ownedPokemon.length;
    parsedData.ownedPokemon = Array.from(new Set(parsedData.ownedPokemon));
    const hasDuplicates = originalLength !== parsedData.ownedPokemon.length;
    
    // 既存の統計データがあり、まだマイグレーションされていない場合のみマイグレーション
    const needsMigration = parsedData.stats && 
      Object.keys(parsedData.levelStats).length === 0 &&
      (parsedData.stats[Difficulty.EASY]?.totalPlays > 0 ||
       parsedData.stats[Difficulty.NORMAL]?.totalPlays > 0 ||
       parsedData.stats[Difficulty.HARD]?.totalPlays > 0);
    
    if (needsMigration) {
      const migrated = this.migrateToLevelSystem(parsedData);
      // マイグレーション後のデータを保存
      this.saveUserData(migrated);
      return migrated;
    }
    
    // 重複が削除された場合は保存
    if (hasDuplicates) {
      this.saveUserData(parsedData);
    }
    
    return parsedData;
  }

  /**
   * 既存のDifficulty形式から新しいLevel形式にデータを移行
   */
  private static migrateToLevelSystem(oldData: UserData): UserData {
    const levelStats: Partial<Record<DifficultyLevel, LevelStats>> = {};
    let highestUnlockedLevel: DifficultyLevel = 1 as DifficultyLevel;
    
    // 既存の統計データから移行
    if (oldData.stats) {
      // EASY → レベル1-5
      if (oldData.stats[Difficulty.EASY]) {
        const easyStats = oldData.stats[Difficulty.EASY];
        if (easyStats.firstClearAchieved || easyStats.totalPlays > 0) {
          // レベル1-5をアンロック
          highestUnlockedLevel = 5 as DifficultyLevel;
          
          // レベル3にEASYの統計を移行（中間レベル）
          levelStats[3 as DifficultyLevel] = {
            level: 3 as DifficultyLevel,
            bestTime: easyStats.bestTime,
            totalPlays: easyStats.totalPlays,
            cleared: easyStats.firstClearAchieved,
            stars: easyStats.firstClearAchieved ? 1 : 0
          };
        }
      }
      
      // NORMAL → レベル6-10
      if (oldData.stats[Difficulty.NORMAL]) {
        const normalStats = oldData.stats[Difficulty.NORMAL];
        if (normalStats.firstClearAchieved || normalStats.totalPlays > 0) {
          // レベル6-10をアンロック
          highestUnlockedLevel = 10 as DifficultyLevel;
          
          // レベル8にNORMALの統計を移行（中間レベル）
          levelStats[8 as DifficultyLevel] = {
            level: 8 as DifficultyLevel,
            bestTime: normalStats.bestTime,
            totalPlays: normalStats.totalPlays,
            cleared: normalStats.firstClearAchieved,
            stars: normalStats.firstClearAchieved ? 2 : 0
          };
        }
      }
      
      // HARD → レベル11-15
      if (oldData.stats[Difficulty.HARD]) {
        const hardStats = oldData.stats[Difficulty.HARD];
        if (hardStats.firstClearAchieved || hardStats.totalPlays > 0) {
          // レベル11-15をアンロック
          highestUnlockedLevel = 15 as DifficultyLevel;
          
          // レベル13にHARDの統計を移行（中間レベル）
          levelStats[13 as DifficultyLevel] = {
            level: 13 as DifficultyLevel,
            bestTime: hardStats.bestTime,
            totalPlays: hardStats.totalPlays,
            cleared: hardStats.firstClearAchieved,
            stars: hardStats.firstClearAchieved ? 3 : 0
          };
        }
      }
    }
    
    return {
      ...oldData,
      levelStats,
      highestUnlockedLevel
    };
  }

  private static getDefaultUserData(): UserData {
    return {
      points: 0,
      ownedPokemon: [],
      stats: {
        [Difficulty.EASY]: {
          bestTime: null,
          totalPlays: 0,
          firstClearAchieved: false
        },
        [Difficulty.NORMAL]: {
          bestTime: null,
          totalPlays: 0,
          firstClearAchieved: false
        },
        [Difficulty.HARD]: {
          bestTime: null,
          totalPlays: 0,
          firstClearAchieved: false
        }
      },
      levelStats: {},
      highestUnlockedLevel: 1 as DifficultyLevel
    };
  }

  /**
   * 現在のユーザーデータをエクスポート用の形式で取得
   */
  static exportUserData(): ExportData {
    const userData = this.loadUserData();
    const now = new Date();
    
    return {
      version: '1.0.0',
      exportDate: now.toISOString(),
      userData
    };
  }

  /**
   * エクスポートデータをJSONファイルとしてダウンロード
   */
  static downloadExportFile(): void {
    const exportData = this.exportUserData();
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // タイムスタンプを含むファイル名を生成
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `pokemon-math-data-${timestamp}.json`;
    
    // ダウンロードリンクを作成してクリック
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // クリーンアップ
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
