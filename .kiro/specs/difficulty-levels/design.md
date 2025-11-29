# Design Document

## Overview

現在の3段階の難易度システムを20段階のレベルシステムに拡張します。各レベルは段階的に難易度が上がり、ユーザーは自分のペースで学習を進めることができます。

## Architecture

### 変更が必要なコンポーネント

1. **types/index.ts**: Difficulty enumを拡張
2. **services/ProblemGenerator.ts**: レベルベースの問題生成ロジック
3. **components/DifficultySelector**: レベル選択UI
4. **contexts/UserContext**: レベルごとの統計管理
5. **services/RewardCalculator**: レベルベースの報酬計算

## Components and Interfaces

### 1. Difficulty Type の変更

```typescript
// 現在
export enum Difficulty {
  EASY = 'easy',
  NORMAL = 'normal',
  HARD = 'hard'
}

// 新しい設計
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 
                               11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20;

export interface LevelConfig {
  level: DifficultyLevel;
  name: string;
  timeLimit: number; // 秒
  operationTypes: OperationType[];
  numberRange: {
    min: number;
    max: number;
  };
  pointsMultiplier: number;
}
```

### 2. ProblemGenerator の拡張

```typescript
class ProblemGenerator {
  static generateForLevel(level: DifficultyLevel, count: number): Problem[] {
    const config = this.getLevelConfig(level);
    // レベル設定に基づいて問題を生成
  }
  
  private static getLevelConfig(level: DifficultyLevel): LevelConfig {
    // レベル1-5: 1桁足し算
    // レベル6-10: 1桁引き算・掛け算
    // レベル11-15: 2桁足し算・引き算
    // レベル16-20: 2桁掛け算
  }
}
```

### 3. LevelSelector Component

```typescript
interface LevelSelectorProps {
  unlockedLevels: DifficultyLevel[];
  onSelectLevel: (level: DifficultyLevel) => void;
}

// グリッド形式で20個のレベルボタンを表示
// ロックされたレベルは灰色で表示
// クリア済みレベルにはチェックマークを表示
```

### 4. UserStats の変更

```typescript
// 現在
export interface UserStats {
  [key: string]: {  // difficulty level
    bestTime: number | null;
    totalPlays: number;
    firstClearAchieved: boolean;
  };
}

// 新しい設計
export interface LevelStats {
  level: DifficultyLevel;
  bestTime: number | null;
  totalPlays: number;
  cleared: boolean;
  stars: number; // 0-3 (パフォーマンスに基づく)
}

export interface UserData {
  points: number;
  ownedPokemon: number[];
  levelStats: Record<DifficultyLevel, LevelStats>;
  highestUnlockedLevel: DifficultyLevel;
}
```

## Data Models

### Level Configuration

各レベルの設定：

- **レベル1-5**: 1桁の足し算（0-9）、制限時間10分
- **レベル6-10**: 1桁の引き算・掛け算（0-9）、制限時間8分
- **レベル11-15**: 2桁の足し算・引き算（10-99）、制限時間7分
- **レベル16-20**: 2桁の掛け算（10-99）、制限時間6分

### Reward Multipliers

- レベル1-5: 1.0x
- レベル6-10: 1.5x
- レベル11-15: 2.0x
- レベル16-20: 3.0x

## Error Handling

- ロックされたレベルを選択しようとした場合、エラーメッセージを表示
- レベル設定が見つからない場合、デフォルト設定を使用
- 統計データの読み込みに失敗した場合、初期値を使用

## Testing Strategy

- 各レベルで正しい問題が生成されることを確認
- レベルのアンロック機能が正しく動作することを確認
- 統計データが正しく保存・読み込まれることを確認
- 報酬計算が正しく行われることを確認

## Migration Strategy

既存のユーザーデータを新しい形式に移行：

1. EASY → レベル1-5のいずれかをアンロック
2. NORMAL → レベル6-10のいずれかをアンロック
3. HARD → レベル11-15のいずれかをアンロック
4. 既存の統計データを対応するレベルにマッピング
