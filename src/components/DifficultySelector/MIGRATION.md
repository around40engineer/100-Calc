# DifficultySelector から LevelSelector への移行ガイド

## 概要

`DifficultySelector` は非推奨となり、新しい `LevelSelector` への移行を推奨します。

### 主な変更点

- **3段階の難易度** → **20段階のレベルシステム**
- より細かい難易度調整が可能
- レベルごとの統計情報とアンロックシステム
- 段階的な学習体験の提供

## 移行手順

### 1. インポートの変更

```tsx
// 旧
import { DifficultySelector } from './components/DifficultySelector';

// 新
import { LevelSelector } from './components/LevelSelector';
```

### 2. コンポーネントの置き換え

```tsx
// 旧: DifficultySelector
<DifficultySelector 
  onStart={(difficulty, pokemon) => {
    // difficulty は Difficulty enum (EASY, NORMAL, HARD)
    startGame(difficulty, pokemon);
  }} 
/>

// 新: LevelSelector
<LevelSelector 
  onStart={(level, pokemon) => {
    // level は DifficultyLevel (1-20)
    startGame(level, pokemon);
  }} 
/>
```

### 3. 難易度とレベルの対応

既存の難易度システムから新しいレベルシステムへの対応:

| 旧難易度 | 新レベル | 説明 |
|---------|---------|------|
| EASY (簡単) | レベル1-5 | 1桁の足し算 |
| NORMAL (普通) | レベル6-10 | 1桁の引き算・掛け算 |
| HARD (難しい) | レベル11-15 | 2桁の足し算・引き算 |
| - | レベル16-20 | 2桁の掛け算（新規） |

### 4. 型定義の更新

```tsx
// 旧
import { Difficulty } from './types';
function startGame(difficulty: Difficulty, pokemon: Pokemon) { ... }

// 新
import { DifficultyLevel } from './types';
function startGame(level: DifficultyLevel, pokemon: Pokemon) { ... }
```

### 5. GameContext の更新

`GameContext` の `startSession` 関数は両方の型をサポートしています:

```tsx
// 旧形式（後方互換性のためサポート）
startSession(Difficulty.EASY);

// 新形式（推奨）
startSession(1 as DifficultyLevel);
```

## 移行時の注意点

### 後方互換性

- `DifficultySelector` は引き続き動作しますが、開発環境で警告が表示されます
- 既存のコードは動作し続けますが、新機能は利用できません

### データ移行

- `UserContext` は自動的に旧形式のデータを新形式に移行します
- 既存のユーザー統計は対応するレベルにマッピングされます

### 段階的な移行

1. まず `LevelSelector` を導入
2. 既存の `DifficultySelector` と並行して動作確認
3. 問題がなければ `DifficultySelector` を削除

## 新機能

`LevelSelector` では以下の新機能が利用できます:

- **20段階のレベル**: より細かい難易度調整
- **レベルアンロックシステム**: 前のレベルをクリアすると次のレベルが解放
- **レベル別統計**: 各レベルのベストタイム、クリア状態、星の数
- **段階的な報酬**: レベルが上がるほど高い報酬
- **レアポケモン**: 高レベルでレアポケモンの出現率アップ

## サポート

質問や問題がある場合は、以下を参照してください:

- [LevelSelector のドキュメント](../LevelSelector/LevelSelector.tsx)
- [設計ドキュメント](../../../.kiro/specs/difficulty-levels/design.md)
- [要件ドキュメント](../../../.kiro/specs/difficulty-levels/requirements.md)
